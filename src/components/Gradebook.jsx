import React, { useState, useMemo } from "react";

// Modular table element rendering list metrics within the Gradebook component
function GradeTable({ rows, compact = false, sortBy = "", sortOrder = "", onSort = null }) {
  const renderHeader = (label, field) => {
    if (compact || !onSort) {
      return <th>{label}</th>;
    }
    const isCurrent = sortBy === field;
    return (
      <th className="sortable" onClick={() => onSort(field)}>
        {label}
        {isCurrent && (
          <span className="sort-indicator">
            {sortOrder === "asc" ? " ▲" : " ▼"}
          </span>
        )}
      </th>
    );
  };

  return (
    <div className={`table-wrap ${compact ? "compact" : ""}`}>
      <table>
        <thead>
          <tr>
            {renderHeader("Assessment", "title")}
            {renderHeader("Module", "module")}
            {renderHeader("Date", "date")}
            {renderHeader("Score", "score")}
            {renderHeader("Status", "status")}
          </tr>
        </thead>
        <tbody>
          {rows.length > 0 ? (
            rows.map((row) => (
              <tr key={row.id}>
                <td>{row.title}</td>
                <td>{row.module}</td>
                <td>{row.date}</td>
                <td><strong>{row.score}%</strong></td>
                <td><span className={`result ${row.status === "Passed" ? "pass" : "review"}`}>{row.status}</span></td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" style={{ textAlign: "center", padding: "30px 10px" }}>
                No matching assessment records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// Gradebook manager enabling table searches and custom sort orders
function Gradebook({ gradebook }) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");

  // Filter rows
  const filteredRows = useMemo(() => {
    return gradebook.filter(row => 
      row.title.toLowerCase().includes(search.toLowerCase()) ||
      row.module.toLowerCase().includes(search.toLowerCase())
    );
  }, [gradebook, search]);

  // Sort rows
  const sortedRows = useMemo(() => {
    const sorted = [...filteredRows];
    sorted.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (sortBy === "score") {
        valA = Number(valA);
        valB = Number(valB);
      } else {
        valA = String(valA).toLowerCase();
        valB = String(valB).toLowerCase();
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredRows, sortBy, sortOrder]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Lag-free gradebook</p>
          <h3>Assessment history</h3>
        </div>
        <span className="status-pill">{sortedRows.length} rows</span>
      </div>

      <div className="gradebook-search-container">
        <input
          type="text"
          className="gradebook-search-input"
          placeholder="Search assessments or modules..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <GradeTable 
        rows={sortedRows} 
        sortBy={sortBy} 
        sortOrder={sortOrder} 
        onSort={handleSort} 
      />
    </section>
  );
}

export default Gradebook;
export { GradeTable };
