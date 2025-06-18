import React, { useState, useEffect } from "react";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Dialog } from "primereact/dialog";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputTextarea } from "primereact/inputtextarea";
import { Tag } from "primereact/tag";
import "primeflex/primeflex.css";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import apiBaseUrl from "../../api_config";
import axios from "axios";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { MultiSelect } from "primereact/multiselect";

const DashboardComp = () => {
      const {user} =useSelector((state)=>state.auth)

  const [issues, setIssues] = useState([]);
  const [filters, setFilters] = useState({ status: null, priority: null, keyword: "" });
  const [issueDialog, setIssueDialog] = useState(false);
  const [newIssue, setNewIssue] = useState({ description: "", status: "open", priority: "low", completed_by: "", started_by: user.name, petitioner_name: "", contact_type: "", contact_value: "", related_to_indicators: "", indicator_code: "", organizations_id: null});
  const [loading, setLoading] = useState(true);
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [currentIssueId, setCurrentIssueId] = useState(null);
  const [editIssue, setEditIssue] = useState({});  // prefill with same structure as newIssue
  const [organizations, setOrganizations] = useState([]);
  const [indicators, setIndicators] = useState([]);


  // useEffect(() => {
  //   const storedIssues = JSON.parse(localStorage.getItem("issues")) || [];
  //   setIssues(storedIssues);
  // }, []);

  /////////////////
    useEffect(()=>{
        getIssues();
        getOrganizations();
        getIndicators();
        setLoading(false);
        // initFilters();
    },[]);

    const getOrganizations = async () => {
        try {
            const response = await axios.get(`${apiBaseUrl}/organizations`);
            setOrganizations(response.data);
        } catch (error) {
            console.error("Failed to load organizations:", error.message);
            alert("Could not fetch organizations");
        }
      };

    const organizationOptions = organizations.map(org => ({
        label: org.name,
        value: org.id
    }));

    const getIndicators = async () => {
    try {
        const response = await axios.get(`${apiBaseUrl}/indicators`);
        setIndicators(response.data);
    } catch (error) {
        console.error("Failed to load indicators:", error.message);
        alert("Could not fetch indicators");
    }
};

const indicatorOptions = indicators.map(ind => ({
    label: ind.code,
    value: ind.code
}));


    ///REQUEST USERS FROM SERVER AND SET CONST
    const getIssues = async() =>{
        try {
            const response = await axios.get(`${apiBaseUrl}/issues`, {timeout: 5000});
            setIssues(response.data);

            console.log("Issues", response.data)
            
            // console.log("roles2",uniqueRole)
            // console.log(response.data)

            
        } catch (error) {
            console.log("Custom error message: Failed to fetch issues");

            if (error.response && error.response.status === 403) {
                console.log("You are not authorized to view this resource.");
                alert("Access denied! Please contact an administrator.");
            } else {
                console.log("An error occurred:", error.message);
            }
        }
        
    }

  ///////////////////

  const statusOptions = ["open", "in-progress", "resolved", "unresolved"].map(s => ({ label: s.charAt(0).toUpperCase() + s.slice(1), value: s }));
  const priorityOptions = ["low", "medium", "high"].map(p => ({ label: p.charAt(0).toUpperCase() + p.slice(1), value: p }));

  ///DELETE USER SESSION FROM SERVER  
    const deleteIssue = async(issueId)=>{
      console.log("Id deleted: ",issueId)
        await axios.delete(`${apiBaseUrl}/issues/${issueId}`);
        getIssues();
    }

  const openEditDialog = async (id) => {
      try {
        const response = await axios.get(`${apiBaseUrl}/issues/${id}`);
        setEditIssue(response.data);
        setCurrentIssueId(id);
        setEditDialogVisible(true);
      } catch (error) {
        console.error("Error loading issue:", error);
        alert("Failed to load issue details.");
      }
    };


    const updateIssue = async () => {
    try {
      await axios.patch(`${apiBaseUrl}/issues/${currentIssueId}`, editIssue);
      setEditDialogVisible(false);
      getIssues(); // Refresh data
    } catch (error) {
      console.error("Failed to update issue:", error);
      alert("Failed to update issue.");
    }
};

  // const saveIssues = (updatedIssues) => {
  //   localStorage.setItem("issues", JSON.stringify(updatedIssues));
  //   setIssues(updatedIssues);
  // };

  // const addIssue = () => {
  //   const id = issues.length ? Math.max(...issues.map(i => i.id)) + 1 : 1;
  //   const date = new Date().toISOString();
  //   const issue = { ...newIssue, id, date };
  //   const updated = [...issues, issue];
  //   saveIssues(updated);
  //   setIssueDialog(false);
  //   setNewIssue({ title: "", description: "", status: "open", priority: "low", solution: "" });
  // };
  const addIssue = async () => {
  try {
    await axios.post(`${apiBaseUrl}/issues`, 
      {
        description: newIssue.description,
        status: newIssue.status,
        priority: newIssue.priority,
        started_by: newIssue.started_by,
        completed_by: newIssue.completed_by,
        petitioner_name: newIssue.petitioner_name,
        contact_type: newIssue.contact_type,
        contact_value: newIssue.contact_value,
        related_to_indicators: newIssue.related_to_indicators,
        indicator_code: newIssue.indicator_code,
        organizations_id: newIssue.organizations_id
      }
    );
    setIssueDialog(false)
    window.location.reload()
    
    // getIssues(); // refresh
    // setIssueDialog(false);
    // setNewIssue({
    //   description: "",
    //   priority: "low",
    //   status: "open",
    //   completed_by: "",
    //   started_by: "",
    //   petitioner_name: "",
    //   contact_type: "",
    //   contact_value: "",
    //   related_to_indicators: "",
    //   indicator_code: "",
    //   organizations_id: 1
    // });
  } catch (error) {
    console.error("Failed to add issue:", error.message);
    alert("Failed to add issue. Check console for details.");
  }
};


  const filteredIssues = issues.filter(issue => {
    return (
      (!filters.status || issue.status === filters.status) &&
      (!filters.priority || issue.priority === filters.priority) &&
      (filters.keyword === "" || issue.title.toLowerCase().includes(filters.keyword.toLowerCase()) || issue.description.toLowerCase().includes(filters.keyword.toLowerCase()))
    );
  });

  ///ACTION BUTTONS FUNCTION
    const actionsBodyTemplate=(rowData)=>{
        const id=rowData.id
        return(

            <div className=" flex flex-wrap justify-content-center gap-3">
               
                {user && user.role!=="admin" &&(
                    <div>
                    </div>
                )}
                {user && user.role ==="admin" && (
                <span className='flex gap-1'>
                
                    <Button className='action-button' outlined  icon="pi pi-pen-to-square" aria-label="Εdit" onClick={()=> openEditDialog(id)}/>
                    <Button className='action-button' outlined icon="pi pi-trash" severity="danger" aria-label="delete" onClick={()=>deleteIssue(id)} />
                </span>
            
                )}

            </div>
 
        );
    }

  const statusTemplate = (rowData) => (
  <Tag
    value={rowData.status}
    severity={
      rowData.status === "resolved"
        ? "success"
        : rowData.status === "in-progress"
        ? "info"
        : "warning"
    }
  />
);

const priorityTemplate = (rowData) => (
  <Tag
    value={rowData.priority}
    severity={
      rowData.priority === "critical"
        ? "danger"
        : rowData.priority === "high"
        ? "warning"
        : rowData.priority === "medium"
        ? "info"
        : "success"
    }
  />
);

  return (
    <div className="p-4">
      <div className="flex flex-wrap align-items-center justify-content-between mb-3">
        <h2 className="m-0">Issue Tracking Dashboard</h2>
        <Button
          label="New Issue"
          icon="pi pi-plus"
          onClick={() => setIssueDialog(true)}
        />
      </div>
      <div className="flex flex-wrap gap-3 mb-3">
        <Dropdown
          value={filters.status}
          options={statusOptions}
          onChange={(e) => setFilters({ ...filters, status: e.value })}
          placeholder="Select Status"
        />
        <Dropdown
          value={filters.priority}
          options={priorityOptions}
          onChange={(e) => setFilters({ ...filters, priority: e.value })}
          placeholder="Select Priority"
        />
        <InputText
          value={filters.keyword}
          onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
          placeholder="Search..."
        />
      </div>
      {/* <DataTable value={filteredIssues} paginator rows={5} className="p-datatable-sm">
        <Column field="id" header="ID" style={{ width: "4em" }} />
        <Column field="title" header="Title" />
        <Column field="status" header="Status" body={statusTemplate} />
        <Column field="priority" header="Priority" body={priorityTemplate} />
        <Column field="date" header="Reported" />
      </DataTable> */}

      <DataTable
        value={filteredIssues}
        paginator
        rows={10}
        className="p-datatable-sm"
        scrollable
        scrollHeight="600px"
        emptyMessage="No issues found"
      >
        <Column field="id" header="ID" style={{ width: "4em" }} />
        <Column
          field="description"
          header="Description"
          style={{ minWidth: "12rem" }}
        />
        <Column
          field="priority"
          header="Priority"
          body={priorityTemplate}
          style={{ minWidth: "8rem" }}
        />
        <Column
          field="status"
          header="Status"
          body={statusTemplate}
          style={{ minWidth: "8rem" }}
        />
        <Column
          field="started_by"
          header="Started By"
          style={{ minWidth: "10rem" }}
        />
        <Column
          field="completed_by"
          header="Completed By"
          style={{ minWidth: "10rem" }}
        />
        <Column
          field="petitioner_name"
          header="Petitioner"
          style={{ minWidth: "10rem" }}
        />
        <Column
          field="contact_type"
          header="Contact Type"
          style={{ minWidth: "8rem" }}
        />
        <Column
          field="contact_value"
          header="Contact Value"
          style={{ minWidth: "12rem" }}
        />
        <Column
          field="related_to_indicators"
          header="Related Indicators"
          style={{ minWidth: "12rem" }}
        />
        <Column
          field="indicator_code"
          header="Indicator Code"
          style={{ minWidth: "10rem" }}
        />
        <Column
          field="organization.name"
          header="Organization Name "
          style={{ minWidth: "6rem" }}
        />
        <Column
          header="actions"
          field="id"
          body={actionsBodyTemplate}
          alignFrozen="right"
          frozen
        />
      </DataTable>

      <Dialog
        header="Add New Issue"
        visible={issueDialog}
        style={{ width: "450px" }}
        modal
        className="p-fluid"
        onHide={() => setIssueDialog(false)}
      >
        <div className="field">
          <label htmlFor="description">Description</label>
          <InputTextarea
            id="description"
            value={newIssue.description}
            onChange={(e) =>
              setNewIssue({ ...newIssue, description: e.target.value })
            }
            rows={3}
            required
          />
        </div>

        <div className="formgrid grid">
          <div className="field col">
            <label htmlFor="priority">Priority</label>
            <Dropdown
              value={newIssue.priority}
              options={priorityOptions}
              onChange={(e) => setNewIssue({ ...newIssue, priority: e.value })}
              placeholder="Select Priority"
            />
          </div>
          <div className="field col">
            <label htmlFor="status">Status</label>
            <Dropdown
              value={newIssue.status}
              options={statusOptions}
              onChange={(e) => setNewIssue({ ...newIssue, status: e.value })}
              placeholder="Select Status"
            />
          </div>
        </div>

        <div className="formgrid grid">
          <div className="field col">
            <label htmlFor="started_by">Started By</label>
            <InputText
              id="started_by"
              value={user.name}
              onChange={(e) =>
                setNewIssue({ ...newIssue, started_by: user.name })
              }
              disabled
            />
            {console.log(user.name)}
          </div>
          <div className="field col">
            <label htmlFor="completed_by">Completed By</label>
            <InputText
              id="completed_by"
              value={newIssue.completed_by}
              onChange={(e) =>
                setNewIssue({ ...newIssue, completed_by: e.target.value })
              }
            />
          </div>
        </div>

        <div className="formgrid grid">
          <div className="field col">
            <label htmlFor="petitioner_name">Petitioner Name</label>
            <InputText
              id="petitioner_name"
              value={newIssue.petitioner_name}
              onChange={(e) =>
                setNewIssue({ ...newIssue, petitioner_name: e.target.value })
              }
            />
          </div>
          <div className="field col">
            <label htmlFor="contact_type">Contact Type</label>
            <InputText
              id="contact_type"
              value={newIssue.contact_type}
              onChange={(e) =>
                setNewIssue({ ...newIssue, contact_type: e.target.value })
              }
            />
          </div>
        </div>

        <div className="formgrid grid">
          <div className="field col">
            <label htmlFor="contact_value">Contact Value</label>
            <InputText
              id="contact_value"
              value={newIssue.contact_value}
              onChange={(e) =>
                setNewIssue({ ...newIssue, contact_value: e.target.value })
              }
            />
          </div>
          <div className="field col">
            <label htmlFor="related_to_indicators">Related Indicator</label>
            <InputText
              id="related_to_indicators"
              value={newIssue.related_to_indicators}
              onChange={(e) =>
                setNewIssue({
                  ...newIssue,
                  related_to_indicators: e.target.value,
                })
              }
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="indicator_code">Indicator Code</label>
          <Dropdown
            value={newIssue.indicator_code}
            options={indicatorOptions}
            onChange={(e) =>
              setNewIssue({ ...newIssue, indicator_code: e.value })
            }
            placeholder="Select Indicator Code"
            filter
            showClear
            filterBy="label"
          />
        </div>

        <div className="field">
          <label htmlFor="organizations_id">Organization</label>
          <Dropdown
            value={newIssue.organizations_id}
            options={organizationOptions}
            onChange={(e) =>
              setNewIssue({ ...newIssue, organizations_id: e.value })
            }
            placeholder="Select an Organization"
          />
        </div>

        <div className="flex justify-content-end mt-3">
          <Button
            label="Cancel"
            icon="pi pi-times"
            className="p-button-text mr-2"
            onClick={() => setIssueDialog(false)}
          />
          <Button label="Add" icon="pi pi-check" onClick={addIssue} autoFocus />
        </div>
      </Dialog>

      <Dialog
        header="Edit Issue"
        visible={editDialogVisible}
        style={{ width: "500px" }}
        modal
        className="p-fluid"
        onHide={() => setEditDialogVisible(false)}
      >
        <div className="field">
          <label htmlFor="description">Description</label>
          <InputTextarea
            id="description"
            value={editIssue.description || ""}
            onChange={(e) =>
              setEditIssue({ ...editIssue, description: e.target.value })
            }
            rows={3}
          />
        </div>

        <div className="formgrid grid">
          <div className="field col">
            <label htmlFor="priority">Priority</label>
            <Dropdown
              value={editIssue.priority}
              options={priorityOptions}
              onChange={(e) =>
                setEditIssue({ ...editIssue, priority: e.value })
              }
            />
          </div>
          <div className="field col">
            <label htmlFor="status">Status</label>
            <Dropdown
              value={editIssue.status}
              options={statusOptions}
              onChange={(e) => setEditIssue({ ...editIssue, status: e.value })}
            />
          </div>
        </div>

        <div className="formgrid grid">
          <div className="field col">
            <label htmlFor="started_by">Started By</label>
            <InputText
              value={user.name}
              onChange={() =>
                setEditIssue({ ...editIssue, started_by: user.name })
              }
              disabled
            />
          </div>
          <div className="field col">
            <label htmlFor="completed_by">Completed By</label>
            <InputText
              value={editIssue.completed_by || ""}
              onChange={(e) =>
                setEditIssue({ ...editIssue, completed_by: e.target.value })
              }
            />
          </div>
        </div>

        <div className="formgrid grid">
          <div className="field col">
            <label htmlFor="petitioner_name">Petitioner Name</label>
            <InputText
              value={editIssue.petitioner_name || ""}
              onChange={(e) =>
                setEditIssue({ ...editIssue, petitioner_name: e.target.value })
              }
            />
          </div>
          <div className="field col">
            <label htmlFor="contact_type">Contact Type</label>
            <InputText
              value={editIssue.contact_type || ""}
              onChange={(e) =>
                setEditIssue({ ...editIssue, contact_type: e.target.value })
              }
            />
          </div>
        </div>

        <div className="formgrid grid">
          <div className="field col">
            <label htmlFor="contact_value">Contact Value</label>
            <InputText
              value={editIssue.contact_value || ""}
              onChange={(e) =>
                setEditIssue({ ...editIssue, contact_value: e.target.value })
              }
            />
          </div>
          <div className="field col">
            <label htmlFor="related_to_indicators">Related Indicator</label>
            <InputText
              value={editIssue.related_to_indicators || ""}
              onChange={(e) =>
                setEditIssue({
                  ...editIssue,
                  related_to_indicators: e.target.value,
                })
              }
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="indicator_code">Indicator Code</label>
          <Dropdown
            value={editIssue.indicator_code}
            options={indicatorOptions}
            onChange={(e) =>
              setEditIssue({ ...editIssue, indicator_code: e.value })
            }
            placeholder="Select Indicator Code"
            filter
            showClear
            filterBy="label"
          />
        </div>

        <div className="field">
          <label htmlFor="organizations_id">Organization</label>
          <Dropdown
            value={editIssue.organizations_id}
            options={organizationOptions}
            onChange={(e) =>
              setEditIssue({ ...editIssue, organizations_id: e.value })
            }
            placeholder="Select an Organization"
          />
        </div>

        <div className="flex justify-content-end mt-3">
          <Button
            label="Cancel"
            icon="pi pi-times"
            className="p-button-text mr-2"
            onClick={() => setEditDialogVisible(false)}
          />
          <Button
            label="Update"
            icon="pi pi-check"
            onClick={updateIssue}
            autoFocus
          />
        </div>
      </Dialog>
    </div>
  );
};

export default DashboardComp;
