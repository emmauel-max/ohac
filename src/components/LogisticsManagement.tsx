import { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../hooks/useAuth";
import type {
  BorrowedLogisticsRecord,
  LogisticsProgram,
  ProgramDistributionEntry,
  User,
  WeeklyInventoryRecord,
} from "../types";
import "./LogisticsManagement.css";

type LogisticsScreen = "dashboard" | "inventory" | "distribution" | "borrowing";

const INVENTORY_ITEMS = [
  "Ceremonial Tops",
  "Ceremonial Downs",
  "Forage Caps",
  "White Belts",
  "Black Belts",
  "Green Belts",
  "Mirror Shoes",
  "Rifles",
  "Camouflage Tops",
  "Camouflage Downs",
  "Boots",
  "Camouflage Caps",
] as const;

const WEEKS_TO_SHOW = 8;

function getWeekStart(date = new Date()): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

function toWeekKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function weekLabel(weekKey: string): string {
  const date = new Date(`${weekKey}T00:00:00`);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function docIdFromItem(item: string): string {
  return item.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function sumNumbersInText(text: string): number {
  const numbers = text.match(/\d+/g);
  if (!numbers || numbers.length === 0) return 1;
  return numbers.reduce((sum, value) => sum + Number(value), 0);
}

export default function LogisticsManagement() {
  const {
    canAccessLogistics,
    canEditLogistics,
    isQuartermaster,
    isRqms,
    isMajor,
    matchedOfficer,
    currentUser,
    userProfile,
  } = useAuth();

  const [activeScreen, setActiveScreen] = useState<LogisticsScreen>("dashboard");
  const [loading, setLoading] = useState(false);

  const [inventoryRecords, setInventoryRecords] = useState<WeeklyInventoryRecord[]>([]);
  const [inventoryDraft, setInventoryDraft] = useState<Record<string, Record<string, string>>>({});

  const [programs, setPrograms] = useState<LogisticsProgram[]>([]);
  const [newProgramName, setNewProgramName] = useState("");
  const [selectedProgramId, setSelectedProgramId] = useState<string>("");
  const [cadetName, setCadetName] = useState("");
  const [cadetPhone, setCadetPhone] = useState("");
  const [itemsGiven, setItemsGiven] = useState("");

  const [borrowRecords, setBorrowRecords] = useState<BorrowedLogisticsRecord[]>([]);
  const [borrowerName, setBorrowerName] = useState("");
  const [borrowerContact, setBorrowerContact] = useState("");
  const [borrowerHall, setBorrowerHall] = useState("");
  const [borrowPurpose, setBorrowPurpose] = useState("");
  const [borrowItemsAndQuantities, setBorrowItemsAndQuantities] = useState("");
  const [borrowReturnDate, setBorrowReturnDate] = useState("");
  const [issueCondition, setIssueCondition] = useState("");
  const [returnCondition, setReturnCondition] = useState("");

  const [users, setUsers] = useState<User[]>([]);
  const [promotionEmail, setPromotionEmail] = useState("");

  const currentWeekKey = toWeekKey(getWeekStart(new Date()));

  const weekKeys = useMemo(() => {
    const start = getWeekStart(new Date());
    return Array.from({ length: WEEKS_TO_SHOW }, (_, index) => {
      const week = new Date(start);
      week.setDate(start.getDate() - index * 7);
      return toWeekKey(week);
    }).reverse();
  }, []);

  const selectedProgram = useMemo(
    () => programs.find((program) => program.id === selectedProgramId) || null,
    [programs, selectedProgramId]
  );

  const roleLabel = useMemo(() => {
    if (isQuartermaster) return "Quartermaster";
    if (isRqms) return "RQMS";
    if (isMajor) return "Major (Read-only)";
    return "Officer";
  }, [isQuartermaster, isRqms, isMajor]);

  const actorRole: "qm" | "rqms" | "major" = isQuartermaster
    ? "qm"
    : isRqms
      ? "rqms"
      : "major";

  useEffect(() => {
    if (!canAccessLogistics) return;

    const fetchAll = async () => {
      setLoading(true);
      try {
        const [inventorySnap, programsSnap, borrowSnap, usersSnap] = await Promise.all([
          getDocs(query(collection(db, "logisticsInventoryWeekly"), orderBy("item", "asc"))),
          getDocs(query(collection(db, "logisticsPrograms"), orderBy("createdAt", "desc"))),
          getDocs(query(collection(db, "logisticsBorrowLogs"), orderBy("createdAt", "desc"))),
          getDocs(collection(db, "users")),
        ]);

        const inventoryData = inventorySnap.docs.map(
          (d) => ({ id: d.id, ...d.data() } as WeeklyInventoryRecord)
        );
        const programData = programsSnap.docs.map(
          (d) => ({ id: d.id, ...d.data() } as LogisticsProgram)
        );
        const borrowData = borrowSnap.docs.map(
          (d) => ({ id: d.id, ...d.data() } as BorrowedLogisticsRecord)
        );

        setInventoryRecords(inventoryData);
        setPrograms(programData);
        setBorrowRecords(borrowData);
        setUsers(usersSnap.docs.map((d) => ({ ...d.data() } as User)));

        setInventoryDraft((prev) => {
          const nextDraft = { ...prev };
          for (const item of INVENTORY_ITEMS) {
            const existing = inventoryData.find((record) => record.item === item);
            const rowDraft: Record<string, string> = {};
            for (const weekKey of weekKeys) {
              const value = existing?.entries?.[weekKey];
              rowDraft[weekKey] = value === undefined ? "" : String(value);
            }
            nextDraft[item] = rowDraft;
          }
          return nextDraft;
        });

        if (!selectedProgramId && programData.length > 0) {
          setSelectedProgramId(programData[0].id);
        }
      } catch (err) {
        console.error("Failed to load logistics management data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [canAccessLogistics, selectedProgramId, weekKeys]);

  const refreshPrograms = async () => {
    const programsSnap = await getDocs(query(collection(db, "logisticsPrograms"), orderBy("createdAt", "desc")));
    const data = programsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as LogisticsProgram));
    setPrograms(data);
    if (!selectedProgramId && data.length > 0) {
      setSelectedProgramId(data[0].id);
    }
  };

  const refreshBorrowing = async () => {
    const borrowSnap = await getDocs(query(collection(db, "logisticsBorrowLogs"), orderBy("createdAt", "desc")));
    setBorrowRecords(borrowSnap.docs.map((d) => ({ id: d.id, ...d.data() } as BorrowedLogisticsRecord)));
  };

  const refreshInventory = async () => {
    const inventorySnap = await getDocs(query(collection(db, "logisticsInventoryWeekly"), orderBy("item", "asc")));
    const data = inventorySnap.docs.map((d) => ({ id: d.id, ...d.data() } as WeeklyInventoryRecord));
    setInventoryRecords(data);
  };

  const saveWeeklyInventory = async () => {
    if (!canEditLogistics) return;

    const actorName = userProfile?.displayName || currentUser?.displayName || roleLabel;

    await Promise.all(
      INVENTORY_ITEMS.map(async (item) => {
        const id = docIdFromItem(item);
        const row = inventoryDraft[item] || {};
        const entries: Record<string, number> = {};

        for (const weekKey of weekKeys) {
          const rawValue = row[weekKey];
          if (rawValue === "" || rawValue === undefined) continue;
          const value = Number(rawValue);
          if (!Number.isNaN(value)) {
            entries[weekKey] = value;
          }
        }

        await setDoc(
          doc(db, "logisticsInventoryWeekly", id),
          {
            item,
            entries,
            updatedAt: Date.now(),
            updatedByUid: currentUser?.uid || "",
            updatedByName: actorName,
            updatedByRole: actorRole,
          },
          { merge: true }
        );
      })
    );

    await refreshInventory();
    alert("Weekly inventory updated.");
  };

  const createProgram = async () => {
    if (!canEditLogistics) return;
    if (!newProgramName.trim()) {
      alert("Enter a program name.");
      return;
    }

    const actorName = userProfile?.displayName || currentUser?.displayName || roleLabel;

    await addDoc(collection(db, "logisticsPrograms"), {
      programName: newProgramName.trim(),
      createdAt: Date.now(),
      createdByUid: currentUser?.uid || "",
      createdByName: actorName,
      entries: [],
    });

    setNewProgramName("");
    await refreshPrograms();
  };

  const addProgramEntry = async () => {
    if (!canEditLogistics) return;
    if (!selectedProgram) {
      alert("Select a program first.");
      return;
    }
    if (!cadetName.trim() || !cadetPhone.trim() || !itemsGiven.trim()) {
      alert("Fill cadet name, phone, and items given.");
      return;
    }

    const actorName = userProfile?.displayName || currentUser?.displayName || roleLabel;
    const entry: ProgramDistributionEntry = {
      cadetName: cadetName.trim(),
      phone: cadetPhone.trim(),
      itemsGiven: itemsGiven.trim(),
      createdAt: Date.now(),
      createdByUid: currentUser?.uid || "",
      createdByName: actorName,
      createdByRole: isQuartermaster ? "qm" : "rqms",
    };

    const nextEntries = [...(selectedProgram.entries || []), entry];

    await updateDoc(doc(db, "logisticsPrograms", selectedProgram.id), {
      entries: nextEntries,
    });

    setCadetName("");
    setCadetPhone("");
    setItemsGiven("");
    await refreshPrograms();
  };

  const addBorrowRecord = async () => {
    if (!canEditLogistics) return;
    if (
      !borrowerName.trim() ||
      !borrowerContact.trim() ||
      !borrowerHall.trim() ||
      !borrowPurpose.trim() ||
      !borrowItemsAndQuantities.trim() ||
      !borrowReturnDate
    ) {
      alert("Please fill all required borrowing fields.");
      return;
    }

    const actorName = userProfile?.displayName || currentUser?.displayName || roleLabel;

    await addDoc(collection(db, "logisticsBorrowLogs"), {
      borrowerName: borrowerName.trim(),
      contact: borrowerContact.trim(),
      hall: borrowerHall.trim(),
      purpose: borrowPurpose.trim(),
      itemsAndQuantities: borrowItemsAndQuantities.trim(),
      returnDate: borrowReturnDate,
      issueCondition: issueCondition.trim(),
      returnCondition: returnCondition.trim(),
      createdAt: Date.now(),
      createdByUid: currentUser?.uid || "",
      createdByName: actorName,
      createdByRole: isQuartermaster ? "qm" : "rqms",
    });

    setBorrowerName("");
    setBorrowerContact("");
    setBorrowerHall("");
    setBorrowPurpose("");
    setBorrowItemsAndQuantities("");
    setBorrowReturnDate("");
    setIssueCondition("");
    setReturnCondition("");

    await refreshBorrowing();
  };

  const promoteUserByEmail = async () => {
    if (!isQuartermaster) return;

    const normalizedEmail = promotionEmail.trim().toLowerCase();
    if (!normalizedEmail) {
      alert("Enter the user email to promote.");
      return;
    }

    const usersCollection = collection(db, "users");
    const [exactSnap, lowerSnap] = await Promise.all([
      getDocs(query(usersCollection, where("email", "==", promotionEmail.trim()), limit(1))),
      getDocs(query(usersCollection, where("email", "==", normalizedEmail), limit(1))),
    ]);

    const userDoc = exactSnap.docs[0] || lowerSnap.docs[0];
    if (!userDoc) {
      alert("No user found with that email.");
      return;
    }

    await updateDoc(doc(db, "users", userDoc.id), { logisticsRole: "rqms" });
    setUsers((prev) =>
      prev.map((u) => (u.uid === userDoc.id ? { ...u, logisticsRole: "rqms" } : u))
    );
    setPromotionEmail("");
    alert("User promoted to RQMS.");
  };

  const dashboardStats = useMemo(() => {
    const weekStart = getWeekStart(new Date()).getTime();

    const inventoryUpdates = inventoryRecords.filter((record) => record.updatedAt >= weekStart);
    const programEntries = programs.flatMap((program) => program.entries || []);
    const weeklyProgramEntries = programEntries.filter((entry) => entry.createdAt >= weekStart);
    const weeklyBorrow = borrowRecords.filter((record) => record.createdAt >= weekStart);

    const byQm =
      inventoryUpdates.filter((entry) => entry.updatedByRole === "qm").length +
      weeklyProgramEntries.filter((entry) => entry.createdByRole === "qm").length +
      weeklyBorrow.filter((entry) => entry.createdByRole === "qm").length;

    const byRqms =
      inventoryUpdates.filter((entry) => entry.updatedByRole === "rqms").length +
      weeklyProgramEntries.filter((entry) => entry.createdByRole === "rqms").length +
      weeklyBorrow.filter((entry) => entry.createdByRole === "rqms").length;

    const itemsOutPrograms = weeklyProgramEntries.reduce(
      (sum, entry) => sum + sumNumbersInText(entry.itemsGiven),
      0
    );

    const itemsOutLending = weeklyBorrow.reduce(
      (sum, entry) => sum + sumNumbersInText(entry.itemsAndQuantities),
      0
    );

    return {
      byQm,
      byRqms,
      itemsOutPrograms,
      itemsOutLending,
      totalItemsOut: itemsOutPrograms + itemsOutLending,
    };
  }, [inventoryRecords, programs, borrowRecords]);

  if (!canAccessLogistics) {
    return (
      <div className="logistics-page">
        <div className="logistics-denied">
          <h2>Access Restricted</h2>
          <p>This page is only available to the Quartermaster, RQMS, and Major.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="logistics-page">
      <header className="logistics-header">
        <h1>Logistics Management</h1>
        <p>
          Signed in as <strong>{roleLabel}</strong>
          {matchedOfficer?.name ? ` · ${matchedOfficer.name}` : ""}
        </p>
        {!canEditLogistics && (
          <p className="logistics-readonly-note">
            Read-only mode enabled. Only Quartermaster and RQMS can update records.
          </p>
        )}
      </header>

      <div className="logistics-tabs four-tabs">
        <button
          className={`logistics-tab ${activeScreen === "dashboard" ? "active" : ""}`}
          onClick={() => setActiveScreen("dashboard")}
          type="button"
        >
          Dashboard
        </button>
        <button
          className={`logistics-tab ${activeScreen === "inventory" ? "active" : ""}`}
          onClick={() => setActiveScreen("inventory")}
          type="button"
        >
          Weekly Inventory
        </button>
        <button
          className={`logistics-tab ${activeScreen === "distribution" ? "active" : ""}`}
          onClick={() => setActiveScreen("distribution")}
          type="button"
        >
          Uniform Distribution
        </button>
        <button
          className={`logistics-tab ${activeScreen === "borrowing" ? "active" : ""}`}
          onClick={() => setActiveScreen("borrowing")}
          type="button"
        >
          Borrowing
        </button>
      </div>

      {activeScreen === "dashboard" && (
        <section className="logistics-card">
          <h2>Weekly Logistics Dashboard</h2>
          <p className="logistics-hint">Current week starts: {weekLabel(currentWeekKey)}</p>

          <div className="stats-grid">
            <article className="stat-box">
              <h3>Logged By QM</h3>
              <p>{dashboardStats.byQm}</p>
            </article>
            <article className="stat-box">
              <h3>Logged By RQMS</h3>
              <p>{dashboardStats.byRqms}</p>
            </article>
            <article className="stat-box">
              <h3>Items Out (Lending)</h3>
              <p>{dashboardStats.itemsOutLending}</p>
            </article>
            <article className="stat-box">
              <h3>Items Out (Programs)</h3>
              <p>{dashboardStats.itemsOutPrograms}</p>
            </article>
            <article className="stat-box stat-box-wide">
              <h3>Total Items Out This Week</h3>
              <p>{dashboardStats.totalItemsOut}</p>
            </article>
          </div>

          <div className="logistics-card section-gap">
            <h3>Promote User To RQMS (by email)</h3>
            <div className="form-inline">
              <input
                className="logistics-input"
                value={promotionEmail}
                onChange={(e) => setPromotionEmail(e.target.value)}
                placeholder="user@email.com"
                disabled={!isQuartermaster}
              />
              <button
                type="button"
                className="primary-btn"
                onClick={promoteUserByEmail}
                disabled={!isQuartermaster}
              >
                Promote To RQMS
              </button>
            </div>
            {!isQuartermaster && (
              <p className="readonly-mini">Only Quartermaster can promote by email.</p>
            )}
          </div>

          <div className="rqms-list section-gap">
            <h3>Current RQMS Users</h3>
            {users.filter((user) => user.logisticsRole === "rqms").length === 0 ? (
              <p className="logistics-empty">No RQMS assigned yet.</p>
            ) : (
              users
                .filter((user) => user.logisticsRole === "rqms")
                .map((user) => (
                  <article key={user.uid} className="rqms-user-card">
                    <div>
                      <h4>{user.displayName || "Unknown User"}</h4>
                      <p>{user.email || "No email"}</p>
                    </div>
                  </article>
                ))
            )}
          </div>
        </section>
      )}

      {activeScreen === "inventory" && (
        <section className="logistics-card">
          <h2>Weekly Inventory Screen</h2>
          <p className="logistics-hint">
            Items are listed by rows, and weeks continue horizontally for spreadsheet-style updates.
          </p>

          <div className="sheet-table-wrap">
            <table className="sheet-table inventory-table">
              <thead>
                <tr>
                  <th>Item</th>
                  {weekKeys.map((weekKey) => (
                    <th key={weekKey}>{weekLabel(weekKey)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {INVENTORY_ITEMS.map((item) => (
                  <tr key={item}>
                    <td className="item-cell">{item}</td>
                    {weekKeys.map((weekKey) => (
                      <td key={`${item}-${weekKey}`}>
                        <input
                          type="number"
                          className="logistics-input compact-input"
                          value={inventoryDraft[item]?.[weekKey] || ""}
                          onChange={(e) =>
                            setInventoryDraft((prev) => ({
                              ...prev,
                              [item]: {
                                ...(prev[item] || {}),
                                [weekKey]: e.target.value,
                              },
                            }))
                          }
                          disabled={!canEditLogistics}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="sheet-actions">
            <button
              type="button"
              className="primary-btn"
              onClick={saveWeeklyInventory}
              disabled={!canEditLogistics}
            >
              Save Weekly Inventory
            </button>
          </div>
        </section>
      )}

      {activeScreen === "distribution" && (
        <section className="logistics-card">
          <h2>Uniform Distribution Screen</h2>
          <p className="logistics-hint">
            Create programs, then record each cadet, contact, and items received for that program.
          </p>

          <div className="form-inline">
            <input
              className="logistics-input"
              value={newProgramName}
              onChange={(e) => setNewProgramName(e.target.value)}
              placeholder="Program name"
              disabled={!canEditLogistics}
            />
            <button
              type="button"
              className="primary-btn"
              onClick={createProgram}
              disabled={!canEditLogistics}
            >
              Add Program
            </button>
          </div>

          <div className="program-layout section-gap">
            <div className="program-list">
              <h3>Programs</h3>
              {programs.length === 0 ? (
                <p className="logistics-empty">No programs added yet.</p>
              ) : (
                programs.map((program) => (
                  <button
                    key={program.id}
                    type="button"
                    className={`program-item ${selectedProgramId === program.id ? "active" : ""}`}
                    onClick={() => setSelectedProgramId(program.id)}
                  >
                    {program.programName}
                  </button>
                ))
              )}
            </div>

            <div className="program-detail">
              <h3>{selectedProgram ? selectedProgram.programName : "Select a program"}</h3>

              {selectedProgram && (
                <>
                  <div className="logistics-form-grid">
                    <input
                      className="logistics-input"
                      placeholder="Cadet name"
                      value={cadetName}
                      onChange={(e) => setCadetName(e.target.value)}
                      disabled={!canEditLogistics}
                    />
                    <input
                      className="logistics-input"
                      placeholder="Phone number"
                      value={cadetPhone}
                      onChange={(e) => setCadetPhone(e.target.value)}
                      disabled={!canEditLogistics}
                    />
                    <input
                      className="logistics-input"
                      placeholder="Items given (e.g 1 top, 1 belt)"
                      value={itemsGiven}
                      onChange={(e) => setItemsGiven(e.target.value)}
                      disabled={!canEditLogistics}
                    />
                  </div>

                  <div className="sheet-actions">
                    <button
                      type="button"
                      className="primary-btn"
                      onClick={addProgramEntry}
                      disabled={!canEditLogistics}
                    >
                      Save Distribution Entry
                    </button>
                  </div>

                  <div className="sheet-table-wrap section-gap">
                    <table className="sheet-table">
                      <thead>
                        <tr>
                          <th>Cadet</th>
                          <th>Phone</th>
                          <th>Items Given</th>
                          <th>By</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(selectedProgram.entries || []).length === 0 ? (
                          <tr>
                            <td colSpan={5} className="logistics-empty">No entries yet.</td>
                          </tr>
                        ) : (
                          selectedProgram.entries.map((entry, index) => (
                            <tr key={`${selectedProgram.id}-entry-${index}`}>
                              <td>{entry.cadetName}</td>
                              <td>{entry.phone}</td>
                              <td>{entry.itemsGiven}</td>
                              <td>{entry.createdByName}</td>
                              <td>{new Date(entry.createdAt).toLocaleDateString()}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      )}

      {activeScreen === "borrowing" && (
        <section className="logistics-card">
          <h2>Borrowing Screen</h2>
          <p className="logistics-hint">
            Record borrower details, items with quantities, and issue/return conditions.
          </p>

          <div className="logistics-form-grid">
            <input
              className="logistics-input"
              placeholder="Borrower name"
              value={borrowerName}
              onChange={(e) => setBorrowerName(e.target.value)}
              disabled={!canEditLogistics}
            />
            <input
              className="logistics-input"
              placeholder="Contact"
              value={borrowerContact}
              onChange={(e) => setBorrowerContact(e.target.value)}
              disabled={!canEditLogistics}
            />
            <input
              className="logistics-input"
              placeholder="Hall"
              value={borrowerHall}
              onChange={(e) => setBorrowerHall(e.target.value)}
              disabled={!canEditLogistics}
            />
          </div>

          <div className="logistics-form-grid">
            <input
              className="logistics-input"
              placeholder="Purpose"
              value={borrowPurpose}
              onChange={(e) => setBorrowPurpose(e.target.value)}
              disabled={!canEditLogistics}
            />
            <input
              className="logistics-input"
              placeholder="Items and specific numbers"
              value={borrowItemsAndQuantities}
              onChange={(e) => setBorrowItemsAndQuantities(e.target.value)}
              disabled={!canEditLogistics}
            />
            <input
              className="logistics-input"
              type="date"
              value={borrowReturnDate}
              onChange={(e) => setBorrowReturnDate(e.target.value)}
              disabled={!canEditLogistics}
            />
          </div>

          <div className="logistics-form-grid">
            <input
              className="logistics-input"
              placeholder="Condition upon issue"
              value={issueCondition}
              onChange={(e) => setIssueCondition(e.target.value)}
              disabled={!canEditLogistics}
            />
            <input
              className="logistics-input"
              placeholder="Condition upon return"
              value={returnCondition}
              onChange={(e) => setReturnCondition(e.target.value)}
              disabled={!canEditLogistics}
            />
          </div>

          <div className="sheet-actions">
            <button
              type="button"
              className="primary-btn"
              onClick={addBorrowRecord}
              disabled={!canEditLogistics}
            >
              Save Borrowing Record
            </button>
          </div>

          <div className="sheet-table-wrap section-gap">
            <table className="sheet-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Hall</th>
                  <th>Purpose</th>
                  <th>Items</th>
                  <th>Return Date</th>
                  <th>Issue Condition</th>
                  <th>Return Condition</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="logistics-empty">Loading...</td>
                  </tr>
                ) : borrowRecords.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="logistics-empty">No borrowing records yet.</td>
                  </tr>
                ) : (
                  borrowRecords.map((record) => (
                    <tr key={record.id}>
                      <td>{record.borrowerName}</td>
                      <td>{record.contact}</td>
                      <td>{record.hall}</td>
                      <td>{record.purpose}</td>
                      <td>{record.itemsAndQuantities}</td>
                      <td>{record.returnDate}</td>
                      <td>{record.issueCondition || "-"}</td>
                      <td>{record.returnCondition || "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
