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
import { PiListBulletsFill,PiFlagCheckeredFill ,PiClockCountdownBold ,PiXCircleFill ,PiWarningCircleFill, PiCheckCircleFill, PiTimerFill, PiClipboardTextFill } from "react-icons/pi";
import {BsXCircleFill} from "react-icons/bs"
import "../../../css/kpis.css"
import { Divider } from "primereact/divider";
import { FilterMatchMode } from 'primereact/api';


const DashboardComp = () => {
      const {user} =useSelector((state)=>state.auth)

  const [issues, setIssues] = useState([]);
  const [filters, setFilters] = useState({ status: null, priority: null, keyword: "" });
  const [issueDialog, setIssueDialog] = useState(false);
  const [newIssue, setNewIssue] = useState({ description: "", status: "open", priority: "low", severity: "not important", assigned_to: user?.name, started_by: user?.name, petitioner_name: "", contact_type: "email", contact_value: "", related_to_indicators: "no", indicator_code: "", organizations_id: null, startDate: null, endDate: null, user_id: user?.id, category_id: null, solution_id: null, solution_title: "", solution_desc: "" }); // prefill with same structure as editIssue
  const [loading, setLoading] = useState(true);
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [currentIssueId, setCurrentIssueId] = useState(null);
  const [editIssue, setEditIssue] = useState({});  // prefill with same structure as newIssue
  const [organizations, setOrganizations] = useState([]);
  const [indicators, setIndicators] = useState([]);
  const [users, setUsers] = useState([]); 
  const [categories, setCategories] = useState([]);
  const [linkedSolution, setLinkedSolution] = useState({ title: "", desc: "", id: null });
  const [tableFilters, setTableFilters] = useState({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  status: { value: null, matchMode: FilterMatchMode.EQUALS },
  priority: { value: null, matchMode: FilterMatchMode.EQUALS },
  description: { value: null, matchMode: FilterMatchMode.CONTAINS },
  started_by: { value: null, matchMode: FilterMatchMode.CONTAINS },
  assigned_to: { value: null, matchMode: FilterMatchMode.CONTAINS },
  petitioner_name: { value: null, matchMode: FilterMatchMode.CONTAINS },
  severity: { value: null, matchMode: FilterMatchMode.EQUALS },
  contact_type: { value: null, matchMode: FilterMatchMode.EQUALS },
  contact_value: { value: null, matchMode: FilterMatchMode.CONTAINS },
  related_to_indicators: { value: null, matchMode: FilterMatchMode.EQUALS },
  indicator_code: { value: null, matchMode: FilterMatchMode.EQUALS },
  'organization.id': { value: null, matchMode: FilterMatchMode.EQUALS },
  'category.id': { value: null, matchMode: FilterMatchMode.EQUALS },
  startDate: { value: null, matchMode: FilterMatchMode.DATE_IS },
  endDate: { value: null, matchMode: FilterMatchMode.DATE_IS },

});

const [solutionDialogVisible, setSolutionDialogVisible] = useState(false);
const [selectedSolution, setSelectedSolution] = useState({ title: "", desc: "" });

const [indicatorFilterOptions, setIndicatorFilterOptions] = useState([]);
const [filteredOrganizationOptions, setFilteredOrganizationOptions] = useState([]);
const [filteredCategoryOptions, setFilteredCategoryOptions] = useState([]);




const handleViewSolution = async (issueId) => {
  try {
    const response = await axios.get(`${apiBaseUrl}/issues/${issueId}`);
    const issue = response.data;

    if (issue.solution_id) {
      const solRes = await axios.get(`${apiBaseUrl}/solutions/${issue.solution_id}`);
      const sol = solRes.data;

      setSelectedSolution({
        title: sol.solution_title,
        desc: sol.solution_desc,
      });

      setSolutionDialogVisible(true);
    } else {
      alert("This resolved issue does not have a linked solution.");
    }
  } catch (error) {
    console.error("Error fetching solution:", error);
    alert("Could not load the solution.");
  }
};


 
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
          const response = await axios.get(`${apiBaseUrl}/issues`, {
            timeout: 5000,
          });

          const issuesWithDates = response.data.map((issue) => ({
            ...issue,
            startDate: issue.startDate ? new Date(issue.startDate) : null,
            endDate: issue.endDate ? new Date(issue.endDate) : null,
          }));

          setIssues(issuesWithDates);

          const uniqueUsedIndicatorCodes = [
            ...new Set(
              response.data
                .map((issue) => issue.indicator_code)
                .filter((code) => code)
            ),
          ];

          const usedIndicatorOptions = uniqueUsedIndicatorCodes.map((code) => ({
            label: code,
            value: code,
          }));

          setIndicatorFilterOptions(usedIndicatorOptions);

          // Extract unique organizations from issue.organization
          const uniqueOrganizations = Array.from(
            new Map(
              response.data
                .filter(
                  (issue) => issue.organization?.id && issue.organization?.name
                )
                .map((issue) => [
                  issue.organization.id,
                  issue.organization.name,
                ])
            )
          );

          console.log("Organizations", uniqueOrganizations);
          setFilteredOrganizationOptions(
            uniqueOrganizations.map(([id, name]) => ({
              label: name,
              value: id,
            }))
          );

          // Extract unique categories from issue.category
          const uniqueCategories = Array.from(
            new Map(
              response.data
                .filter(
                  (issue) => issue.category?.id && issue.category?.category_name
                )
                .map((issue) => [
                  issue.category.id,
                  issue.category.category_name,
                ])
            )
          );
          setFilteredCategoryOptions(
            uniqueCategories.map(([id, name]) => ({
              label: name,
              value: id,
            }))
          );

          console.log("Issues", issues);

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
          const response = await axios.get(
            `${apiBaseUrl}/issues/user/${user.id}`,
            { timeout: 5000 }
          );

          const issuesWithDates = response.data.map((issue) => ({
            ...issue,
            startDate: issue.startDate ? new Date(issue.startDate) : null,
            endDate: issue.endDate ? new Date(issue.endDate) : null,
          }));
          setIssues(issuesWithDates);

          const uniqueUsedIndicatorCodes = [
            ...new Set(
              response.data
                .map((issue) => issue.indicator_code)
                .filter((code) => code)
            ),
          ];

          const usedIndicatorOptions = uniqueUsedIndicatorCodes.map((code) => ({
            label: code,
            value: code,
          }));

          setIndicatorFilterOptions(usedIndicatorOptions);

          

          console.log("Issues", issues);

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
      const issue = response.data;

      setEditIssue(issue);
      setCurrentIssueId(id);
      setEditDialogVisible(true);

      // Fetch linked solution if any
      if (issue.solution_id) {
        const solutionResponse = await axios.get(
          `${apiBaseUrl}/solutions/${issue.solution_id}`
        );
        const sol = solutionResponse.data;
        setLinkedSolution({
          id: sol.id,
          title: sol.solution_title || "",
          desc: sol.solution_desc || "",
        });
      } else {
        setLinkedSolution({ id: null, title: "", desc: "" });
      }
    } catch (error) {
      console.error("Error loading issue or solution:", error);
      alert("Failed to load issue details.");
    }
  };



   const updateIssue = async () => {
     try {
       let solutionId = editIssue.solution_id; // might be null initially

       // 1. If issue is resolved, handle solution
       if (editIssue.status === "resolved") {
         const { title, desc, id } = linkedSolution;

         if (title.trim() !== "" && desc.trim() !== "") {
           if (id) {
             // 1A: If solution exists, update it
             await axios.patch(`${apiBaseUrl}/solutions/${id}`, {
               solution_title: title,
               solution_desc: desc,
             });
             solutionId = id;
           } else {
             // 1B: Create a new solution and store its ID
             const response = await axios.post(`${apiBaseUrl}/solutions`, {
               solution_title: title,
               solution_desc: desc,
             });
             solutionId = response.data.id;

             // Link it to the issue for PATCH
             setLinkedSolution((prev) => ({ ...prev, id: solutionId }));
           }
         }
       }

       // 2. Update the issue with (possibly) new solution_id
       await axios.patch(`${apiBaseUrl}/issues/${currentIssueId}`, {
         ...editIssue,
         solution_id: solutionId || null,
       });

       setEditDialogVisible(false);
       setLinkedSolution({ id: null, title: "", desc: "" });

       user.role === "user" ? getIssuesByUser() : getIssues();
     } catch (error) {
       console.error("Failed to update issue and/or solution:", error);
       alert("Update failed. Check console for details.");
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
      let createdSolutionId = null;

      // 1. If resolved and solution fields are filled, create a new solution
      if (
        newIssue.status === "resolved" &&
        newIssue.solution_title.trim() !== "" &&
        newIssue.solution_desc.trim() !== ""
      ) {
        const solutionResponse = await axios.post(`${apiBaseUrl}/solutions`, {
          solution_title: newIssue.solution_title,
          solution_desc: newIssue.solution_desc,
        });

        createdSolutionId = solutionResponse.data.id;
      }

      // 2. Create the issue
      await axios.post(`${apiBaseUrl}/issues`, {
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
        solution_id: createdSolutionId,
      });

      setIssueDialog(false);
      window.location.reload();
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
        return (
          <div className=" flex flex-wrap justify-content-center gap-3">
            {user && user.role !== "admin" && <div></div>}
            <span className="flex gap-1">
              <Button
                className="action-button"
                outlined
                icon="pi pi-pen-to-square"
                aria-label="Εdit"
                onClick={() => openEditDialog(id)}
              />
              <Button
                className="action-button"
                outlined
                icon="pi pi-trash"
                severity="danger"
                aria-label="delete"
                onClick={() => deleteIssue(id)}
              />
              {rowData.status === "resolved" && (
                <Button
                  className="action-button"
                  outlined
                  icon="pi pi-key"
                  severity="info"
                  onClick={() => handleViewSolution(id)}
                />
              )}
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

const statusFilterTemplate = (options) => (
  <Dropdown
    value={options.value}
    options={statusOptions}
    onChange={(e) => options.filterCallback(e.value, options.index)}
    placeholder="All"
    className="p-column-filter"
    showClear
  />
);

const priorityFilterTemplate = (options) => (
  <Dropdown
    value={options.value}
    options={priorityOptions}
    onChange={(e) => options.filterCallback(e.value, options.index)}
    placeholder="All"
    className="p-column-filter"
    showClear
  />
);

const severityFilterTemplate = (options) => (
  <Dropdown
    value={options.value}
    options={severityOptions}
    onChange={(e) => options.filterCallback(e.value, options.index)}
    placeholder="All"
    className="p-column-filter"
    showClear
  />
);

const contactTypeFilterTemplate = (options) => (
  <Dropdown
    value={options.value}
    options={contactTypeOptions}
    onChange={(e) => options.filterCallback(e.value, options.index)}
    placeholder="All"
    className="p-column-filter"
    showClear
  />
);

const relatedToIndicatorsFilterTemplate = (options) => (
  <Dropdown
    value={options.value}
    options={["Yes", "No"].map(val => ({ label: val, value: val }))}
    onChange={(e) => options.filterCallback(e.value, options.index)}
    placeholder="All"
    className="p-column-filter"
    showClear
  />
);

const indicatorOptionsFilterTemplate = (options) => (
  <Dropdown
    value={options.value}
    options={indicatorFilterOptions}
    onChange={(e) => options.filterCallback(e.value, options.index)}
    placeholder="All"
    className="p-column-filter"
    showClear
  />
);

const organizationsFilterTemplate = (options) => (
  <Dropdown
    value={options.value}
    options={filteredOrganizationOptions}
    onChange={(e) => options.filterCallback(e.value, options.index)}
    placeholder="All"
    className="p-column-filter"
    showClear
  />
);

// console.log("Organizations", organizationOptions);
const categoryFilterTemplate = (options) => (
  <Dropdown
    value={options.value}
    options={filteredCategoryOptions}
    onChange={(e) => options.filterCallback(e.value, options.index)}
    placeholder="All"
    className="p-column-filter"
    showClear
  />
);

const userOptionsFilterTemplate = (options) => (
  <Dropdown
    value={options.value}
    options={userOptions}
    optionLabel="label"
    optionValue="label"  // Only store the name (string) in filters
    onChange={(e) => options.filterCallback(e.value, options.index)}
    placeholder="All"
    className="p-column-filter"
    showClear
  />
);

const dateFilterTemplate = (options) => (
  <Calendar
    value={options.value}
    onChange={(e) => options.filterCallback(e.value, options.index)}
    placeholder="Select date"
    className="p-column-filter"
    dateFormat="dd/mm/yy"
    showIcon
    showButtonBar
  />
);



const renderKPIs = () => {
  const total = issues.length;
  const open = issues.filter(i => i.status === "open").length;
  const inprogress = issues.filter(i => i.status === "in-progress").length;
  const resolved = issues.filter(i => i.status === "resolved").length;
  const unresolved = issues.filter(i => i.status === "unresolved").length;
  const critical = issues.filter(i => i.severity === "critical").length;

  const kpis = [
    { label: "Total Issues", value: total, icon: <PiListBulletsFill className="text-blue-500 text-3xl" />, bg: "blue", },
    { label: "Open", value: open, icon: <PiFlagCheckeredFill  className="text-yellow-500 text-3xl" />, bg: "yellow" },

    { label: "In Progress", value: inprogress, icon: <PiClockCountdownBold  className="text-purple-500 text-3xl" />, bg: "purple" },
    { label: "Resolved", value: resolved, icon: <PiCheckCircleFill className="text-green-500 text-3xl" />, bg: "green" },
   { label: "Unresolved", value: unresolved, icon: <PiXCircleFill   className="text-red-500 text-3xl" />, bg: "red" },
    { label: "Critical", value: critical, icon: <PiWarningCircleFill className="text-red-500 text-3xl" />, bg: "red" }
  ];

  return (
    <div className="kpi-grid">
      {kpis.map((kpi, idx) => (
        <div
          key={idx}
          className="kpi-card"
          style={{ borderLeft: `5px solid ${kpi.bg}` }}
        >
          <div className="kpi-content">
            <div className="kpi-left">
              <div className="kpi-label">{kpi.label}</div>
              <div className="kpi-value">{kpi.value}</div>
              {kpi.delta && (
                <div
                  className={`kpi-delta ${
                    kpi.deltaPositive ? "positive" : "negative"
                  }`}
                >
                  {kpi.deltaPositive ? "↑" : "↓"} {kpi.delta}
                </div>
              )}
            </div>
            <div className="kpi-icon">{kpi.icon}</div>
          </div>
        </div>
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
      {renderKPIs()} {/* <-- Add this line here */}
      <div className="flex flex-wrap gap-3 mb-3">
        {/* <Dropdown
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
        /> */}
        <InputText
          placeholder="Global Search"
          onInput={(e) =>
            setTableFilters((prev) => ({
              ...prev,
              global: {
                value: e.target.value,
                matchMode: FilterMatchMode.CONTAINS,
              },
            }))
          }
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
        filters={tableFilters}
        onFilter={(e) => setTableFilters(e.filters)}
        globalFilterFields={[
          "description",
          "status",
          "priority",
          "started_by",
          "severity",
          "assigned_to",
          "petitioner_name",
          "contact_type",
          "contact_value",
          "related_to_indicators",
          "indicator_code",
          "organization.id",
          "category.id",
          "startDate",
          "endDate",
        ]}
        className="p-datatable-sm"
        scrollable
        scrollHeight="600px"
        emptyMessage="No issues found"
      >
        <Column field="id" header="ID" style={{ width: "4em" }} />
        <Column
          field="description"
          header="Description"
          filter
          filterPlaceholder="Search by description"
          style={{ minWidth: "12rem" }}
        />
        <Column
          field="priority"
          header="Priority"
          body={priorityTemplate}
          filter
          filterElement={priorityFilterTemplate}
          style={{ minWidth: "8rem" }}
        />
        <Column
          field="status"
          header="Status"
          body={statusTemplate}
          filter
          filterElement={statusFilterTemplate}
          style={{ minWidth: "8rem" }}
        />

        <Column
          field="severity"
          header="Severity"
          body={severityTemplate}
          filter
          filterElement={severityFilterTemplate}
          style={{ minWidth: "8rem" }}
        />

        <Column
          field="started_by"
          header="Started By"
          filter
          filterElement={userOptionsFilterTemplate}
          body={(rowData) => rowData.started_by || user?.name} // display started
          style={{ minWidth: "10rem" }}
        />
        <Column
          field="assigned_to"
          header="Assigned To"
          style={{ minWidth: "10rem" }}
          filter
          filterElement={userOptionsFilterTemplate}
          body={(rowData) => rowData.assigned_to || user?.name}
        />
        <Column
          field="petitioner_name"
          header="Petitioner"
          filter
          filterPlaceholder="Search by petitioner"
          style={{ minWidth: "10rem" }}
        />
        <Column
          field="contact_type"
          header="Contact Type"
          style={{ minWidth: "8rem" }}
          filter
          filterElement={contactTypeFilterTemplate}
        />
        <Column
          field="contact_value"
          header="Contact Value"
          style={{ minWidth: "12rem" }}
          filter
          filterPlaceholder="Search by contact value"
        />
        <Column
          field="related_to_indicators"
          header="Related Indicators"
          style={{ minWidth: "12rem" }}
          filter
          filterElement={relatedToIndicatorsFilterTemplate}
        />
        <Column
          field="indicator_code"
          header="Indicator Code"
          style={{ minWidth: "10rem" }}
          filter
          filterElement={indicatorOptionsFilterTemplate}
        />
        <Column
          field="organization.id" // filter by ID
          header="Organization"
          filter
          filterElement={organizationsFilterTemplate}
          body={(rowData) => rowData.organization?.name} // display name
        />
        <Column
          field="category.id"
          header="Category Name"
          style={{ minWidth: "6rem" }}
          filter
          filterElement={categoryFilterTemplate}
          body={(rowData) => rowData.category?.category_name}
        />
        <Column
          field="startDate"
          header="Start Date"
          style={{ minWidth: "6rem" }}
          filter
          filterElement={dateFilterTemplate}
          dataType="date"
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
          filter
          filterElement={dateFilterTemplate}
          dataType="date"
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
              value={user?.name}
              onChange={(e) =>
                setNewIssue({ ...newIssue, started_by: user?.name })
              }
              disabled
            />
          </div>
          <div className="field col">
            <label htmlFor="assigned_to">Assigned To</label>
            <Dropdown
              value={users.find((u) => u.id === newIssue.user_id) || null}
              options={userOptions}
              onChange={(e) => {
                setNewIssue({
                  ...newIssue,
                  assigned_to: e.value.name,
                  user_id: e.value.id,
                });
              }}
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
              onChange={(e) =>
                setNewIssue({ ...newIssue, contact_type: e.value })
              }
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
              options={[
                { label: "Yes", value: "Yes" },
                { label: "No", value: "No" },
              ]}
              onChange={(e) =>
                setNewIssue({
                  ...newIssue,
                  related_to_indicators: e.value,
                  indicator_code:
                    e.value === "Yes" ? newIssue.indicator_code : "",
                })
              }
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
              onChange={(e) =>
                setNewIssue({ ...newIssue, indicator_code: e.value })
              }
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
            onChange={(e) => setNewIssue({ ...newIssue, startDate: e.value })}
            placeholder="Select a Start Date"
          />
        </div>

        {newIssue.status === "resolved" && (
          <>
            <Divider align="center">
              <span className="p-tag"> Solution</span>
            </Divider>
            <div className="field">
              <label htmlFor="solution_title">Solution Title</label>
              <InputText
                id="solution_title"
                value={newIssue.solution_title}
                onChange={(e) =>
                  setNewIssue({ ...newIssue, solution_title: e.target.value })
                }
                placeholder="Enter Solution Title"
              />
            </div>

            <div className="field">
              <label htmlFor="solution_desc">Solution Description</label>
              <InputTextarea
                id="solution_desc"
                value={newIssue.solution_desc}
                onChange={(e) =>
                  setNewIssue({ ...newIssue, solution_desc: e.target.value })
                }
                rows={3}
                placeholder="Enter Solution Description"
              />
            </div>
          </>
        )}

        <div className="field">
          <label htmlFor="endDate">End Date</label>
          <Calendar
            id="endDate"
            value={newIssue.endDate}
            onChange={(e) => setNewIssue({ ...newIssue, endDate: e.value })}
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

        <div className="field">
          <label htmlFor="severity">Severity</label>
          <Dropdown
            value={editIssue.severity}
            options={severityOptions}
            onChange={(e) => setEditIssue({ ...editIssue, severity: e.value })}
            placeholder="Select Severity"
          />
        </div>

        <div className="formgrid grid">
          <div className="field col">
            <label htmlFor="started_by">Started By</label>
            <InputText
              value={user?.name}
              onChange={() =>
                setEditIssue({ ...editIssue, started_by: user?.name })
              }
              disabled
            />
          </div>
          <div className="field col">
            <label htmlFor="assigned_to">Assigned To</label>
            <Dropdown
              value={users.find((u) => u.name === editIssue.assigned_to)}
              options={userOptions}
              onChange={(e) =>
                setEditIssue({
                  ...editIssue,
                  assigned_to: e.value.name,
                  user_id: e.value.id,
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
              onChange={(e) =>
                setEditIssue({ ...editIssue, contact_type: e.value })
              }
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
              options={[
                { label: "Yes", value: "Yes" },
                { label: "No", value: "No" },
              ]}
              onChange={(e) =>
                setEditIssue({
                  ...editIssue,
                  related_to_indicators: e.value,
                  indicator_code:
                    e.value === "Yes" ? editIssue.indicator_code : "",
                })
              }
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
              onChange={(e) =>
                setEditIssue({ ...editIssue, indicator_code: e.value })
              }
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
            onChange={(e) =>
              setEditIssue({ ...editIssue, category_id: e.value })
            }
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

        {editIssue.status === "resolved" && (
          <>
            <Divider align="center">
              <span className="p-tag">Solution</span>
            </Divider>
            <div className="field">
              <label htmlFor="edit_solution_title">Solution Title</label>
              <InputText
                id="edit_solution_title"
                value={linkedSolution.title}
                onChange={(e) =>
                  setLinkedSolution({
                    ...linkedSolution,
                    title: e.target.value,
                  })
                }
                placeholder="Enter Solution Title"
              />
            </div>

            <div className="field">
              <label htmlFor="edit_solution_desc">Solution Description</label>
              <InputTextarea
                id="edit_solution_desc"
                value={linkedSolution.desc}
                onChange={(e) =>
                  setLinkedSolution({ ...linkedSolution, desc: e.target.value })
                }
                rows={3}
                placeholder="Enter Solution Description"
              />
            </div>
          </>
        )}

        <div className="field">
          <label htmlFor="startDate">Started Date</label>
          <Calendar
            id="startDate"
            value={editIssue.startDate ? new Date(editIssue.startDate) : null}
            onChange={(e) => setEditIssue({ ...editIssue, startDate: e.value })}
            placeholder="Select a Start Date"
          />
        </div>

        <div className="field">
          <label htmlFor="endDate">End Date</label>
          <Calendar
            id="endDate"
            value={editIssue.endDate ? new Date(editIssue.endDate) : null}
            onChange={(e) => setEditIssue({ ...editIssue, endDate: e.value })}
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
      <Dialog
        header="Solution Details"
        visible={solutionDialogVisible}
        onHide={() => setSolutionDialogVisible(false)}
        style={{ width: "40vw" }}
        modal
      >
        <div className="p-3">
          <div className="mb-3">
            <h5 className="text-primary">Solution Title</h5>
            <p>
              <strong>{selectedSolution.title || "No title provided"}</strong>
            </p>
          </div>
          <div>
            <h5 className="text-primary">Solution Description</h5>
            <p>{selectedSolution.desc || "No description provided"}</p>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default DashboardComp;
