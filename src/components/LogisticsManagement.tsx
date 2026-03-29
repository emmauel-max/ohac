import { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../hooks/useAuth";
import type {
  BorrowedLogisticsRecord,
  LogisticsShareRecord,
  User,
} from "../types";
import "./LogisticsManagement.css";

type LogisticsTab = "sharing" | "borrowing" | "armoury";

interface ShareFormRow {
  item: string;
  quantity: string;
  condition: string;
  notes: string;
}

interface BorrowFormRow {
  item: string;
  quantity: string;
  expectedReturnCondition: string;
}

const emptyShareRow = (): ShareFormRow => ({
  item: "",
  quantity: "",
  condition: "",
  notes: "",
});

const emptyBorrowRow = (): BorrowFormRow => ({
  item: "",
  quantity: "",
  expectedReturnCondition: "",
});

export default function LogisticsManagement() {
  const {
    canAccessLogistics,
    canEditLogistics,
    isMajor,
    isQuartermaster,
    matchedOfficer,
    currentUser,
    userProfile,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<LogisticsTab>("sharing");
  const [loading, setLoading] = useState(false);

  const [shareRecords, setShareRecords] = useState<LogisticsShareRecord[]>([]);
  const [borrowRecords, setBorrowRecords] = useState<BorrowedLogisticsRecord[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [destinationUnit, setDestinationUnit] = useState("");
  const [purpose, setPurpose] = useState("");
  const [dispatchDate, setDispatchDate] = useState("");
  const [shareRows, setShareRows] = useState<ShareFormRow[]>([emptyShareRow()]);

  const [borrowingUnit, setBorrowingUnit] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [reason, setReason] = useState("");
  const [borrowRows, setBorrowRows] = useState<BorrowFormRow[]>([emptyBorrowRow()]);

  useEffect(() => {
    if (!canAccessLogistics) return;

    const fetchAllData = async () => {
      setLoading(true);
      try {
        const [sharesSnap, borrowSnap, usersSnap] = await Promise.all([
          getDocs(query(collection(db, "logisticsShares"), orderBy("createdAt", "desc"))),
          getDocs(query(collection(db, "logisticsBorrowLogs"), orderBy("createdAt", "desc"))),
          getDocs(collection(db, "users")),
        ]);

        setShareRecords(
          sharesSnap.docs.map((d) => ({ id: d.id, ...d.data() } as LogisticsShareRecord))
        );
        setBorrowRecords(
          borrowSnap.docs.map((d) => ({ id: d.id, ...d.data() } as BorrowedLogisticsRecord))
        );
        setUsers(usersSnap.docs.map((d) => ({ ...d.data() } as User)));
      } catch (err) {
        console.error("Failed to load logistics data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [canAccessLogistics]);

  const roleLabel = useMemo(() => {
    if (isQuartermaster) return "Quartermaster";
    if (isMajor) return "Major (Read-only)";
    return "Officer";
  }, [isMajor, isQuartermaster]);

  const submitShareForm = async () => {
    if (!canEditLogistics) return;

    const validItems = shareRows.filter((row) => row.item.trim() && row.quantity.trim());
    if (!destinationUnit.trim() || !purpose.trim() || !dispatchDate || validItems.length === 0) {
      alert("Please fill destination, purpose, dispatch date, and at least one logistics item.");
      return;
    }

    const createdByName = userProfile?.displayName || currentUser?.displayName || "Quartermaster";

    await addDoc(collection(db, "logisticsShares"), {
      destinationUnit: destinationUnit.trim(),
      purpose: purpose.trim(),
      dispatchDate,
      items: validItems,
      createdAt: Date.now(),
      createdByUid: currentUser?.uid || "",
      createdByName,
    });

    setDestinationUnit("");
    setPurpose("");
    setDispatchDate("");
    setShareRows([emptyShareRow()]);

    const sharesSnap = await getDocs(query(collection(db, "logisticsShares"), orderBy("createdAt", "desc")));
    setShareRecords(sharesSnap.docs.map((d) => ({ id: d.id, ...d.data() } as LogisticsShareRecord)));
  };

  const submitBorrowForm = async () => {
    if (!canEditLogistics) return;

    const validItems = borrowRows.filter((row) => row.item.trim() && row.quantity.trim());
    if (!borrowingUnit.trim() || !contactPerson.trim() || !returnDate || validItems.length === 0) {
      alert("Please fill borrowing unit, contact person, return date, and at least one item.");
      return;
    }

    const createdByName = userProfile?.displayName || currentUser?.displayName || "Quartermaster";

    await addDoc(collection(db, "logisticsBorrowLogs"), {
      borrowingUnit: borrowingUnit.trim(),
      contactPerson: contactPerson.trim(),
      returnDate,
      reason: reason.trim(),
      items: validItems,
      createdAt: Date.now(),
      createdByUid: currentUser?.uid || "",
      createdByName,
    });

    setBorrowingUnit("");
    setContactPerson("");
    setReturnDate("");
    setReason("");
    setBorrowRows([emptyBorrowRow()]);

    const borrowSnap = await getDocs(
      query(collection(db, "logisticsBorrowLogs"), orderBy("createdAt", "desc"))
    );
    setBorrowRecords(
      borrowSnap.docs.map((d) => ({ id: d.id, ...d.data() } as BorrowedLogisticsRecord))
    );
  };

  const updateUserLogisticsRole = async (uid: string, newRole: "none" | "rqms") => {
    if (!canEditLogistics) return;
    await updateDoc(doc(db, "users", uid), { logisticsRole: newRole });
    setUsers((prev) =>
      prev.map((user) => (user.uid === uid ? { ...user, logisticsRole: newRole } : user))
    );
  };

  if (!canAccessLogistics) {
    return (
      <div className="logistics-page">
        <div className="logistics-denied">
          <h2>Access Restricted</h2>
          <p>This page is only available to the Quartermaster and the Major.</p>
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
            Read-only mode: only the Quartermaster can create or edit logistics records.
          </p>
        )}
      </header>

      <div className="logistics-tabs">
        <button
          className={`logistics-tab ${activeTab === "sharing" ? "active" : ""}`}
          onClick={() => setActiveTab("sharing")}
          type="button"
        >
          Sharing Logistics
        </button>
        <button
          className={`logistics-tab ${activeTab === "borrowing" ? "active" : ""}`}
          onClick={() => setActiveTab("borrowing")}
          type="button"
        >
          Borrowing Register
        </button>
        <button
          className={`logistics-tab ${activeTab === "armoury" ? "active" : ""}`}
          onClick={() => setActiveTab("armoury")}
          type="button"
        >
          Armoury Management
        </button>
      </div>

      {activeTab === "sharing" && (
        <section className="logistics-card">
          <h2>Logistics Sharing Sheet</h2>
          <p className="logistics-hint">
            Use this form like a spreadsheet when issuing logistics to other cadet units.
          </p>
          <div className="logistics-form-grid">
            <input
              className="logistics-input"
              value={destinationUnit}
              onChange={(e) => setDestinationUnit(e.target.value)}
              placeholder="Destination Unit"
              disabled={!canEditLogistics}
            />
            <input
              className="logistics-input"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="Purpose"
              disabled={!canEditLogistics}
            />
            <input
              className="logistics-input"
              type="date"
              value={dispatchDate}
              onChange={(e) => setDispatchDate(e.target.value)}
              disabled={!canEditLogistics}
            />
          </div>

          <div className="sheet-table-wrap">
            <table className="sheet-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Quantity</th>
                  <th>Condition</th>
                  <th>Notes</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {shareRows.map((row, index) => (
                  <tr key={`share-row-${index}`}>
                    <td>
                      <input
                        className="logistics-input"
                        value={row.item}
                        onChange={(e) =>
                          setShareRows((prev) =>
                            prev.map((r, i) => (i === index ? { ...r, item: e.target.value } : r))
                          )
                        }
                        disabled={!canEditLogistics}
                      />
                    </td>
                    <td>
                      <input
                        className="logistics-input"
                        value={row.quantity}
                        onChange={(e) =>
                          setShareRows((prev) =>
                            prev.map((r, i) => (i === index ? { ...r, quantity: e.target.value } : r))
                          )
                        }
                        disabled={!canEditLogistics}
                      />
                    </td>
                    <td>
                      <input
                        className="logistics-input"
                        value={row.condition}
                        onChange={(e) =>
                          setShareRows((prev) =>
                            prev.map((r, i) => (i === index ? { ...r, condition: e.target.value } : r))
                          )
                        }
                        disabled={!canEditLogistics}
                      />
                    </td>
                    <td>
                      <input
                        className="logistics-input"
                        value={row.notes}
                        onChange={(e) =>
                          setShareRows((prev) =>
                            prev.map((r, i) => (i === index ? { ...r, notes: e.target.value } : r))
                          )
                        }
                        disabled={!canEditLogistics}
                      />
                    </td>
                    <td>
                      <button
                        type="button"
                        className="sheet-remove-btn"
                        onClick={() =>
                          setShareRows((prev) => prev.filter((_, rowIdx) => rowIdx !== index))
                        }
                        disabled={!canEditLogistics || shareRows.length === 1}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="sheet-actions">
            <button
              type="button"
              className="secondary-btn"
              onClick={() => setShareRows((prev) => [...prev, emptyShareRow()])}
              disabled={!canEditLogistics}
            >
              + Add Row
            </button>
            <button
              type="button"
              className="primary-btn"
              onClick={submitShareForm}
              disabled={!canEditLogistics}
            >
              Save Logistics Share
            </button>
          </div>

          <h3 className="logistics-subtitle">Recent Sharing Entries</h3>
          {loading ? (
            <p className="logistics-empty">Loading...</p>
          ) : shareRecords.length === 0 ? (
            <p className="logistics-empty">No sharing records yet.</p>
          ) : (
            <div className="logistics-records">
              {shareRecords.map((record) => (
                <article key={record.id} className="record-card">
                  <h4>{record.destinationUnit}</h4>
                  <p>
                    <strong>Purpose:</strong> {record.purpose}
                  </p>
                  <p>
                    <strong>Date:</strong> {record.dispatchDate}
                  </p>
                  <p>
                    <strong>By:</strong> {record.createdByName}
                  </p>
                  <ul>
                    {record.items.map((item, idx) => (
                      <li key={`${record.id}-item-${idx}`}>
                        {item.item} · Qty {item.quantity}
                        {item.condition ? ` · ${item.condition}` : ""}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {activeTab === "borrowing" && (
        <section className="logistics-card">
          <h2>Borrowing Register</h2>
          <p className="logistics-hint">
            Record logistics borrowed by outside units and track expected return condition.
          </p>
          <div className="logistics-form-grid">
            <input
              className="logistics-input"
              value={borrowingUnit}
              onChange={(e) => setBorrowingUnit(e.target.value)}
              placeholder="Borrowing Unit"
              disabled={!canEditLogistics}
            />
            <input
              className="logistics-input"
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              placeholder="Contact Person"
              disabled={!canEditLogistics}
            />
            <input
              className="logistics-input"
              type="date"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              disabled={!canEditLogistics}
            />
          </div>

          <textarea
            className="logistics-textarea"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason for borrowing (optional)"
            disabled={!canEditLogistics}
            rows={3}
          />

          <div className="sheet-table-wrap">
            <table className="sheet-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Quantity</th>
                  <th>Expected Return Condition</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {borrowRows.map((row, index) => (
                  <tr key={`borrow-row-${index}`}>
                    <td>
                      <input
                        className="logistics-input"
                        value={row.item}
                        onChange={(e) =>
                          setBorrowRows((prev) =>
                            prev.map((r, i) => (i === index ? { ...r, item: e.target.value } : r))
                          )
                        }
                        disabled={!canEditLogistics}
                      />
                    </td>
                    <td>
                      <input
                        className="logistics-input"
                        value={row.quantity}
                        onChange={(e) =>
                          setBorrowRows((prev) =>
                            prev.map((r, i) => (i === index ? { ...r, quantity: e.target.value } : r))
                          )
                        }
                        disabled={!canEditLogistics}
                      />
                    </td>
                    <td>
                      <input
                        className="logistics-input"
                        value={row.expectedReturnCondition}
                        onChange={(e) =>
                          setBorrowRows((prev) =>
                            prev.map((r, i) =>
                              i === index
                                ? { ...r, expectedReturnCondition: e.target.value }
                                : r
                            )
                          )
                        }
                        disabled={!canEditLogistics}
                      />
                    </td>
                    <td>
                      <button
                        type="button"
                        className="sheet-remove-btn"
                        onClick={() =>
                          setBorrowRows((prev) => prev.filter((_, rowIdx) => rowIdx !== index))
                        }
                        disabled={!canEditLogistics || borrowRows.length === 1}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="sheet-actions">
            <button
              type="button"
              className="secondary-btn"
              onClick={() => setBorrowRows((prev) => [...prev, emptyBorrowRow()])}
              disabled={!canEditLogistics}
            >
              + Add Row
            </button>
            <button
              type="button"
              className="primary-btn"
              onClick={submitBorrowForm}
              disabled={!canEditLogistics}
            >
              Save Borrow Record
            </button>
          </div>

          <h3 className="logistics-subtitle">Recent Borrow Entries</h3>
          {loading ? (
            <p className="logistics-empty">Loading...</p>
          ) : borrowRecords.length === 0 ? (
            <p className="logistics-empty">No borrowing records yet.</p>
          ) : (
            <div className="logistics-records">
              {borrowRecords.map((record) => (
                <article key={record.id} className="record-card">
                  <h4>{record.borrowingUnit}</h4>
                  <p>
                    <strong>Contact:</strong> {record.contactPerson}
                  </p>
                  <p>
                    <strong>Expected Return:</strong> {record.returnDate}
                  </p>
                  {record.reason && (
                    <p>
                      <strong>Reason:</strong> {record.reason}
                    </p>
                  )}
                  <ul>
                    {record.items.map((item, idx) => (
                      <li key={`${record.id}-borrow-item-${idx}`}>
                        {item.item} · Qty {item.quantity}
                        {item.expectedReturnCondition
                          ? ` · Return: ${item.expectedReturnCondition}`
                          : ""}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {activeTab === "armoury" && (
        <section className="logistics-card">
          <h2>Armoury Management</h2>
          <p className="logistics-hint">
            Quartermaster can promote cadets to Regimental Quartermaster Sergeant (RQMS).
          </p>

          {loading ? (
            <p className="logistics-empty">Loading users...</p>
          ) : (
            <div className="rqms-list">
              {users.map((user) => (
                <article key={user.uid} className="rqms-user-card">
                  <div>
                    <h4>{user.displayName || "Unknown User"}</h4>
                    <p>{user.email || "No email"}</p>
                    <p>
                      Current logistics role: <strong>{user.logisticsRole || "none"}</strong>
                    </p>
                  </div>
                  {canEditLogistics ? (
                    <div className="rqms-actions">
                      <button
                        type="button"
                        className="secondary-btn"
                        onClick={() => updateUserLogisticsRole(user.uid, "rqms")}
                        disabled={user.logisticsRole === "rqms"}
                      >
                        Promote to RQMS
                      </button>
                      <button
                        type="button"
                        className="sheet-remove-btn"
                        onClick={() => updateUserLogisticsRole(user.uid, "none")}
                        disabled={(user.logisticsRole || "none") === "none"}
                      >
                        Remove RQMS
                      </button>
                    </div>
                  ) : (
                    <p className="readonly-mini">Major can view only.</p>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
