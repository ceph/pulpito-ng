import React, { useState, useEffect } from "react";
import Typography from "@mui/material/Typography";
import { Helmet } from "react-helmet";
import Button from "@mui/material/Button";
import DeleteIcon from "@mui/icons-material/Delete";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import { useLocalStorage } from "usehooks-ts";

export default function Schedule() {
  const predefinedKeyOptions = [
    "--ceph-repo", "--suite-repo", "--subset",
    "--suite-branch", "--suite", "--limit", 
    "--repo", "--ceph-branch", "subset"
  ];

  const [inputValue, setInputValue] = useLocalStorage("inputValue", "");
  const [selectedKeyIndices, setSelectedKeyIndices] = useLocalStorage("selectedKeyIndices", []);
  const [valueData, setValueData] = useLocalStorage("valueData", []);
  const [hoveredRowIndex, setHoveredRowIndex] = useState(null);
  const [checkedRows, setCheckedRows] = useLocalStorage("checkedRows", []);
  const [rowLocks, setRowLocks] = useLocalStorage("rowLocks", Array(selectedKeyIndices.length).fill(false));
  const [keyLocks, setKeyLocks] = useLocalStorage("keyLocks", Array(selectedKeyIndices.length).fill(false));

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleRun = () => {
    updateCommand(checkedRows);
  };

  const handleDryRun = () => {
    updateCommand(checkedRows);
  };

  useEffect(() => {
    updateCommand(checkedRows);
  }, [selectedKeyIndices, valueData, checkedRows]);

  const addNewRow = () => {
    setSelectedKeyIndices([...selectedKeyIndices, 0]);
    setValueData([...valueData, ""]);
    setRowLocks([...rowLocks, false]);
    setKeyLocks([...keyLocks, false]); 
  };

  const handleCheckboxChange = (index, event) => {
    const newCheckedRows = [...checkedRows];

    if (event.target.checked) {
      newCheckedRows.push(index);
    } else {
      const indexToRemove = newCheckedRows.indexOf(index);
      if (indexToRemove !== -1) {
        newCheckedRows.splice(indexToRemove, 1);
      }
    }

    setCheckedRows(newCheckedRows);
    updateCommand(newCheckedRows);
  };

  const handleKeySelectChange = (index, event) => {
    const updatedSelectedKeyIndices = [...selectedKeyIndices];
    updatedSelectedKeyIndices[index] = event.target.value;
    setSelectedKeyIndices(updatedSelectedKeyIndices);
    updateCommand(checkedRows);
  };

  const handleValueChange = (index, event) => {
    const updatedValueData = [...valueData];
    updatedValueData[index] = event.target.value;
    setValueData(updatedValueData);
    updateCommand(checkedRows);
  };

  const handleDeleteRow = (index) => {
    const updatedSelectedKeyIndices = [...selectedKeyIndices];
    updatedSelectedKeyIndices.splice(index, 1);
    setSelectedKeyIndices(updatedSelectedKeyIndices);

    const updatedValueData = [...valueData];
    updatedValueData.splice(index, 1);
    setValueData(updatedValueData);

    const newCheckedRows = checkedRows.filter((checkedIndex) => checkedIndex !== index);
    setCheckedRows(newCheckedRows);

    const updatedRowLocks = [...rowLocks];
    updatedRowLocks.splice(index, 1);
    setRowLocks(updatedRowLocks);

    const updatedKeyLocks = [...keyLocks];
    updatedKeyLocks.splice(index, 1);
    setKeyLocks(updatedKeyLocks);

    updateCommand(newCheckedRows);
  };

  const toggleRowLock = (index) => {
    const updatedRowLocks = [...rowLocks];
    updatedRowLocks[index] = !updatedRowLocks[index];
    setRowLocks(updatedRowLocks);

    const updatedKeyLocks = [...keyLocks];
    updatedKeyLocks[index] = !updatedKeyLocks[index];
    setKeyLocks(updatedKeyLocks);
  };

  const updateCommand = (checkedRows) => {
    const commandArgs = checkedRows
      .map((index) => {
        const selectedKeyIndex = selectedKeyIndices[index];
        const selectedKey = predefinedKeyOptions[selectedKeyIndex];
        const selectedValue = valueData[index];
        return `${selectedKey} ${selectedValue}`;
      })
      .join(" ");
    const teuthologySuiteCommand = `teuthology suite ${commandArgs}`;

    setInputValue(teuthologySuiteCommand);
  };

  return (
    <div>
      <Helmet>
        <title>Schedule - Pulpito</title>
      </Helmet>
      <Typography variant="h5" style={{ margin: "20px" }}>
        Schedule a run
      </Typography>
      <div style={{ border: "#b4bfa6", position: "relative", padding: 10 }}>
        <input
          type="text"
          style={{ width: "900px", height: "50px" }}
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Enter instructions here"
        />
        <div style={{ position: "absolute", top: 0, right: 0 }}>
          <Button
            style={{ margin: "10px", padding: "8px" }}
            variant="contained"
            color="error"
            onClick={handleRun}
          >
            Run
          </Button>
          <Button
            style={{ margin: "10px", padding: "8px", backgroundColor: "#1976D2", color: "#fff" }}
            variant="contained"
            onClick={handleDryRun}
          >
            Dry Run
          </Button>
        </div>
      </div>
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #777875", padding: "8px", width: "5%" }}></th>
            <th style={{ border: "1px solid #777875", padding: "8px" }}>Key</th>
            <th style={{ border: "1px solid #777875", padding: "8px" }}>Value</th>
          </tr>
        </thead>
        <tbody>
          {selectedKeyIndices.map((selectedKeyIndex, index) => (
            <tr
              key={index}
              onMouseEnter={() => setHoveredRowIndex(index)}
              onMouseLeave={() => setHoveredRowIndex(null)}
              style={{
                background: hoveredRowIndex === index ? "#f5f5f5" : "transparent",
              }}
            >
              <td style={{ border: "1px solid #777875", padding: "8px" }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <input
                    type="checkbox"
                    id={`checkbox${index + 1}`}
                    checked={checkedRows.includes(index)}
                    onChange={(event) => handleCheckboxChange(index, event)}
                  />
                  <div
                    style={{ cursor: "pointer", marginLeft: "8px", color: "#888" }}
                    onClick={() => toggleRowLock(index)}
                  >
                    {rowLocks[index] ? <LockIcon /> : <LockOpenIcon />}
                  </div>
                </div>
              </td>
              <td style={{ border: "1px solid #777875", padding: "8px" }}>
                <select
                  value={selectedKeyIndex}
                  onChange={(event) => handleKeySelectChange(index, event)}
                  disabled={rowLocks[index] || keyLocks[index]} 
                >
                  {predefinedKeyOptions.map((option, optionIndex) => (
                    <option key={optionIndex} value={optionIndex}>
                      {option}
                    </option>
                  ))}
                </select>
              </td>
              <td style={{ border: "1px solid #777875", padding: "8px" }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <input
                    type="text"
                    value={valueData[index]}
                    onChange={(event) => handleValueChange(index, event)}
                    disabled={rowLocks[index]} 
                  />
                  <div
                    style={{ cursor: "pointer", marginLeft: "8px", color: "#888" }}
                    onClick={() => handleDeleteRow(index)}
                  >
                    {hoveredRowIndex === index && <DeleteIcon />}
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button style={{ margin: "10px", padding: "8px" }} onClick={addNewRow}>
        Add Option
      </button>
    </div>
  );
}
