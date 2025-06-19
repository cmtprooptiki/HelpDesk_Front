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
import { Calendar } from "primereact/calendar";

import { Card } from "primereact/card";
import { PiWarningCircleFill, PiCheckCircleFill, PiTimerFill, PiClipboardTextFill } from "react-icons/pi";
import {BsXCircleFill} from "react-icons/bs"


const DashboardComp = () => {
      const {user} =useSelector((state)=>state.auth)

  const [issues, setIssues] = useState([]);
  const [filters, setFilters] = useState({ status: null, priority: null, keyword: "" });
  const [issueDialog, setIssueDialog] = useState(false);
  const [newIssue, setNewIssue] = useState({ description: "", status: "open", priority: "low", severity: "not important", assigned_to: user.name, started_by: user.name, petitioner_name: "", contact_type: "email", contact_value: "", related_to_indicators: "no", indicator_code: "", organizations_id: null, startDate: null, endDate: null, user_id: user.id, category_id: null, solution_id: null }); // prefill with same structure as editIssue
  const [loading, setLoading] = useState(true);
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [currentIssueId, setCurrentIssueId] = useState(null);
  const [editIssue, setEditIssue] = useState({});  // prefill with same structure as newIssue
  const [organizations, setOrganizations] = useState([]);
  const [indicators, setIndicators] = useState([]);
  const [users, setUsers] = useState([]); 
  const [categories, setCategories] = useState([]); 
  useEffect(()=>{

        if (user!=null && user.role=="user"){
            // getColumnNames()
            getIssuesByUser()
            getOrganizations();
            getCategories();
            getUsers();
            getIndicators();
            setLoading(false);
        }
        else if (user!=null && user.role=="admin")
        {
            getIssues();
            getOrganizations();
            getCategories();
            getUsers();
            getIndicators();
            setLoading(false);
        }
        
      

        // initFilters();
    },[user]);


  // useEffect(() => {
  //   const storedIssues = JSON.parse(localStorage.getItem("issues")) || [];
  //   setIssues(storedIssues);
  // }, []);

  /////////////////
    // useEffect(()=>{
    //     getIssues();
    //     getIssuesByUser();
    //     getOrganizations();
    //     getCategories();
    //     getUsers();
    //     getIndicators();
    //     setLoading(false);
    //     // initFilters();
    // },[]);

    const getOrganizations = async () => {
        try {
            const response = await axios.get(`${apiBaseUrl}/organizations`);
            setOrganizations(response.data);
        } catch (error) {
            console.error("Failed to load organizations:", error.message);
            alert("Could not fetch organizations");
        }
      };
      const getCategories = async () => {
        try {
            const response = await axios.get(`${apiBaseUrl}/categories`);
            setCategories(response.data);
        } catch (error) {
            console.error("Failed to load categories:", error.message);
            alert("Could not fetch categories");
        }
      };

      const getUsers = async () => {
        try {
            const response = await axios.get(`${apiBaseUrl}/users`);
            setUsers(response.data);
        } catch (error) {
            console.error("Failed to load users:", error.message);
            alert("Could not fetch users");
        }
      };

      const categoryOptions = categories.map(cat => ({label: cat.category_name, value: cat.id}));


      const userOptions = users.map(user => ({
        label: user.name,
        value: user
    }));

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

    const getIssuesByUser = async() =>{
        try {
            const response = await axios.get(`${apiBaseUrl}/issues/user/${user.id}`, {timeout: 5000});
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
  const severityOptions = ["important", "not important", "critical"].map(p => ({ label: p.charAt(0).toUpperCase() + p.slice(1), value: p }));
  const contactTypeOptions = [
  { label: "Email", value: "email" },
  { label: "Telephone", value: "telephone" }
];


  ///DELETE USER SESSION FROM SERVER  
    const deleteIssue = async(issueId)=>{
      console.log("Id deleted: ",issueId)
        await axios.delete(`${apiBaseUrl}/issues/${issueId}`);
        if(user.role === "user")
        {
          getIssuesByUser();
        }
        else
        {
          getIssues();
        }
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
      if(user.role === "user")
      {
        getIssuesByUser();
      }
      else
      {
        getIssues();
      }
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
        assigned_to: newIssue.assigned_to,
        petitioner_name: newIssue.petitioner_name,
        contact_type: newIssue.contact_type,
        contact_value: newIssue.contact_value,
        related_to_indicators: newIssue.related_to_indicators,
        indicator_code: newIssue.indicator_code,
        organizations_id: newIssue.organizations_id,
        severity: newIssue.severity,
        category_id: newIssue.category_id,
        startDate: newIssue.startDate,
        endDate: newIssue.endDate,
        user_id: newIssue.user_id,
        solution_id: newIssue.solution_id
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
                <span className='flex gap-1'>
                
                    <Button className='action-button' outlined  icon="pi pi-pen-to-square" aria-label="Εdit" onClick={()=> openEditDialog(id)}/>
                    <Button className='action-button' outlined icon="pi pi-trash" severity="danger" aria-label="delete" onClick={()=>deleteIssue(id)} />
                </span>
            
                

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

const severityTemplate = (rowData) => (
  <Tag
    value={rowData.severity}
    severity={
      rowData.severity === "not important"
        ? "success"
        : rowData.severity === "important"
        ? "info"
        : "danger"
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


const renderKPIs = () => {
  const total = issues.length;
  const open = issues.filter(i => i.status === "open").length;
  const inprogress = issues.filter(i => i.status === "in-progress").length;
  const resolved = issues.filter(i => i.status === "resolved").length;
  const unresolved = issues.filter(i => i.status === "unresolved").length;
  const critical = issues.filter(i => i.severety === "critical").length;

  const kpis = [
    { label: "Total Issues", value: total, icon: <PiClipboardTextFill className="text-blue-500 text-3xl" />, bg: "bg-blue-50" },
    { label: "Open", value: open, icon: <PiTimerFill className="text-yellow-500 text-3xl" />, bg: "bg-yellow-50" },

    { label: "In Progress", value: inprogress, icon: <PiTimerFill className="text-purple-500 text-3xl" />, bg: "bg-yellow-50" },
    { label: "Resolved", value: resolved, icon: <PiCheckCircleFill className="text-green-500 text-3xl" />, bg: "bg-green-50" },
   { label: "Unresolved", value: unresolved, icon: <BsXCircleFill  className="text-red-500 text-3xl" />, bg: "bg-red-50" },
    { label: "Critical", value: critical, icon: <PiWarningCircleFill className="text-red-500 text-3xl" />, bg: "bg-red-50" }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 my-4">
      {kpis.map((kpi, idx) => (
        <Card key={idx} className={`shadow-sm ${kpi.bg}`}>
          <div className="flex items-center space-x-4">
            <div>{kpi.icon}</div>
            <div>
              <div className="text-xl font-semibold">{kpi.value}</div>
              <div className="text-sm text-gray-600">{kpi.label}</div>
            </div>
          </div>
        </Card>
      ))}
    </div>

    
  );
};


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

      {renderKPIs()}  {/* <-- Add this line here */}

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
          field="severity"
          header="Severity"
          body={severityTemplate}
          style={{ minWidth: "8rem" }}
        />

        <Column
          field="started_by"
          header="Started By"
          style={{ minWidth: "10rem" }}
        />
        <Column
          field="assigned_to"
          header="Assigned To"
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
          field="category.category_name"
          header="Category Name"
          style={{ minWidth: "6rem" }}
        />
        <Column
  field="startDate"
  header="Start Date"
  style={{ minWidth: "6rem" }}
  body={(rowData) =>
    rowData.startDate
      ? new Date(rowData.startDate).toLocaleDateString("en-GB")
      : ""
  }
/>

<Column
  field="endDate"
  header="End Date"
  style={{ minWidth: "6rem" }}
  body={(rowData) =>
    rowData.endDate
      ? new Date(rowData.endDate).toLocaleDateString("en-GB")
      : ""
  }
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

        <div className="field">
            <label htmlFor="severity">Severity</label>
            <Dropdown
              value={newIssue.severity}
              options={severityOptions}
              onChange={(e) => setNewIssue({ ...newIssue, severity: e.value })}
              placeholder="Select Severity"
            />
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
          </div>
          <div className="field col">
            <label htmlFor="assigned_to">Assigned To</label>
            <Dropdown
            value={users.find(u => u.id === newIssue.user_id) || null}
            options={userOptions}
            onChange={(e) =>
            {
            setNewIssue({
              ...newIssue,
              assigned_to: e.value.name,
              user_id: e.value.id
              })
            }
            }
            optionLabel="label"
            placeholder="Select User"
            filter
            showClear
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
            <Dropdown
              value={newIssue.contact_type}
              options={contactTypeOptions}
              onChange={(e) => setNewIssue({ ...newIssue, contact_type: e.value })}
              placeholder="Select Contact Type"
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
             <label htmlFor="related_to_indicators">Related to Indicator</label>
              <Dropdown
              value={newIssue.related_to_indicators}
              options={[{ label: "Yes", value: "Yes" }, { label: "No", value: "No" }]}
              onChange={(e) => setNewIssue({ ...newIssue, related_to_indicators: e.value, indicator_code: e.value === "Yes" ? newIssue.indicator_code : "" })}
              placeholder="Select Yes or No"
            />
          </div>
        </div>

       {newIssue.related_to_indicators === "Yes" && (
  <div className="field">
    <label htmlFor="indicator_code">Indicator Code</label>
    <Dropdown
      value={newIssue.indicator_code}
      options={indicatorOptions}
      onChange={(e) => setNewIssue({ ...newIssue, indicator_code: e.value })}
      placeholder="Select Indicator Code"
      filter
      showClear
      filterBy="label"
    />
  </div>
)}

        <div className="field">
          <label htmlFor="category">Category</label>
          <Dropdown
            value={newIssue.category_id}
            options={categoryOptions}
            onChange={(e) => setNewIssue({ ...newIssue, category_id: e.value })}
            placeholder="Select Category"
            showClear
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

        <div className="field">
          <label htmlFor="startDate">Started Date</label>
          <Calendar
            id="startDate"
            value={newIssue.startDate}
            onChange={(e) =>
              setNewIssue({ ...newIssue, startDate: e.value })
            }
            placeholder="Select a Start Date"
          />
        </div>

        <div className="field">
          <label htmlFor="endDate">End Date</label>
          <Calendar
            id="endDate"
            value={newIssue.endDate}
            onChange={(e) =>
              setNewIssue({ ...newIssue, endDate: e.value })
            }
            placeholder="Select an End Date"
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
            <label htmlFor="assigned_to">Assigned To</label>
            <Dropdown
            value={users.find(u => u.name === editIssue.assigned_to)}
            options={userOptions}
            onChange={(e) =>
              setEditIssue({
                ...editIssue,
                assigned_to: e.value.name,
                user_id: e.value.id
              })
            }
            optionLabel="label"
            placeholder="Select User"
            filter
            showClear
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
            <Dropdown
              value={editIssue.contact_type}
              options={contactTypeOptions}
              onChange={(e) => setEditIssue({ ...editIssue, contact_type: e.value })}
              placeholder="Select Contact Type"
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
            <label htmlFor="related_to_indicators">Related to Indicator</label>
            <Dropdown
              value={editIssue.related_to_indicators}
              options={[{ label: "Yes", value: "Yes" }, { label: "No", value: "No" }]}
              onChange={(e) => setEditIssue({ ...editIssue, related_to_indicators: e.value, indicator_code: e.value === "Yes" ? editIssue.indicator_code : "" })}
              placeholder="Select Yes or No"
            />
          </div>
        </div>

        {editIssue.related_to_indicators === "Yes" && (
      <div className="field">
        <label htmlFor="indicator_code">Indicator Code</label>
        <Dropdown
          value={editIssue.indicator_code}
          options={indicatorOptions}
          onChange={(e) => setEditIssue({ ...editIssue, indicator_code: e.value })}
          placeholder="Select Indicator Code"
          filter
          showClear
          filterBy="label"
        />
      </div>
    )}

          <div className="field">
        <label htmlFor="category">Category</label>
        <Dropdown
          value={editIssue.category_id}
          options={categoryOptions}
          onChange={(e) => setEditIssue({ ...editIssue, category_id: e.value })}
          placeholder="Select Category"
          showClear
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

        <div className="field">
          <label htmlFor="startDate">Started Date</label>
          <Calendar
            id="startDate"
            value={editIssue.startDate}
            onChange={(e) =>
              setEditIssue({ ...editIssue, startDate: e.value })
            }
            placeholder="Select a Start Date"
          />
        </div>

        <div className="field">
          <label htmlFor="endDate">End Date</label>
          <Calendar
            id="endDate"
            value={editIssue.endDate}
            onChange={(e) =>
              setEditIssue({ ...editIssue, endDate: e.value })
            }
            placeholder="Select an End Date"
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
