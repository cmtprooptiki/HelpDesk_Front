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
import { FilterMatchMode } from 'primereact/api';

const SolutionList = () => {
      const {user} =useSelector((state)=>state.auth)

  const [filters, setFilters] = useState({ status: null, priority: null, keyword: "" });
  const [solutionDialog, setSolutionDialog] = useState(false);
  const [newSolution, setNewSolution] = useState({});
  const [loading, setLoading] = useState(true);
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [currentSolutionId, setCurrentSolutionId] = useState(null);
  const [editSolution, setEditSolution] = useState({});  // prefill with same structure as newCategory
  const [solutions, setSolutions] = useState([]);
  const [issues, setIssues] = useState([]);
  const [selectedIssueId, setSelectedIssueId] = useState(null);
  const [selectedEditIssueId, setSelectedEditIssueId] = useState(null);
  const [previousIssueId, setPreviousIssueId] = useState(null);
  const [unlinkedIssues, setUnlinkedIssues] = useState([]);
  const [tableFilters, setTableFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        solution_title: { value: null, matchMode: FilterMatchMode.CONTAINS},
        solution_desc: { value: null, matchMode: FilterMatchMode.CONTAINS},
      });

  useEffect(() => {
  const fetchUnlinkedIssues = async () => {
    try {
      const response = await axios.get(`${apiBaseUrl}/issues`);
      const allIssues = response.data;

      const issuesWithoutSolutions = allIssues.filter(issue => issue.solution_id === null);
      setUnlinkedIssues(issuesWithoutSolutions);
    } catch (error) {
      console.error("Failed to fetch unlinked issues:", error.message);
    }
  };

  fetchUnlinkedIssues();
}, []);



  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/issues`);
        setIssues(response.data);
      } catch (error) {
        console.error("Failed to fetch issues:", error.message);
      }
    };

    fetchIssues();
  }, []);

  // useEffect(() => {
  //   const storedCategories = JSON.parse(localStorage.getItem("Categories")) || [];
  //   setCategories(storedCategories);
  // }, []);

  /////////////////
    useEffect(()=>{
        getSolutions();
        setLoading(false);
        // initFilters();
    },[]);




    ///REQUEST USERS FROM SERVER AND SET CONST
    const getSolutions = async() =>{
        try {
            const response = await axios.get(`${apiBaseUrl}/solutions`, {timeout: 5000});
            setSolutions(response.data);

            console.log("Solutions", response.data)

            // console.log("roles2",uniqueRole)
            // console.log(response.data)

            
        } catch (error) {
            console.log("Custom error message: Failed to fetch Solutions");

            if (error.response && error.response.status === 403) {
                console.log("You are not authorized to view this resource.");
                alert("Access denied! Please contact an administrator.");
            } else {
                console.log("An error occurred:", error.message);
            }
        }
        
    }

  ///DELETE USER SESSION FROM SERVER  
    const deleteSolution = async(SolutionId)=>{
      console.log("Id deleted: ",SolutionId)
        await axios.delete(`${apiBaseUrl}/solutions/${SolutionId}`);
        getSolutions();
    }

  const openEditDialog = async (id) => {
    try {
      const response = await axios.get(`${apiBaseUrl}/solutions/${id}`);
      const solution = response.data;
      setEditSolution(solution);
      setCurrentSolutionId(id);

      // Find the issue that has this solution_id
      const issuesResponse = await axios.get(`${apiBaseUrl}/issues`);
      setIssues(issuesResponse.data);

      const linkedIssue = issuesResponse.data.find(
        (issue) => issue.solution_id === id
      );

      if (linkedIssue) {
        setPreviousIssueId(linkedIssue.id);
        setSelectedEditIssueId(linkedIssue.id);
      } else {
        setPreviousIssueId(null);
        setSelectedEditIssueId(null);
      }

      setEditDialogVisible(true);
    } catch (error) {
      console.error("Error loading solution or issues:", error);
      alert("Failed to load solution details.");
    }
  };




  const updateSolution = async () => {
    try {
      // 1. Update the solution content (if needed)
      await axios.patch(
        `${apiBaseUrl}/solutions/${currentSolutionId}`,
        editSolution
      );

      // 2. If the issue changed, update the links
      if (previousIssueId && previousIssueId !== selectedEditIssueId) {
        await axios.patch(`${apiBaseUrl}/issues/${previousIssueId}`, {
          solution_id: null,
        });
      }

      if (selectedEditIssueId && selectedEditIssueId !== previousIssueId) {
        await axios.patch(`${apiBaseUrl}/issues/${selectedEditIssueId}`, {
          solution_id: currentSolutionId,
        });
      }

      setEditDialogVisible(false);
      setPreviousIssueId(null);
      setSelectedEditIssueId(null);
      getSolutions();
    } catch (error) {
      console.error("Failed to update solution and re-link issues:", error);
      alert("Failed to update solution or issues.");
    }
  };



  // const saveCategories = (updatedCategories) => {
  //   localStorage.setItem("Categories", JSON.stringify(updatedCategories));
  //   setCategories(updatedCategories);
  // };

  // const addOrganization = () => {
  //   const id = Organizations.length ? Math.max(...Organizations.map(i => i.id)) + 1 : 1;
  //   const date = new Date().toISOString();
  //   const Organization = { ...newOrganization, id, date };
  //   const updated = [...Organizations, Organization];
  //   saveOrganizations(updated);
  //   setOrganizationDialog(false);
  //   setNewOrganization({ title: "", description: "", status: "open", priority: "low", solution: "" });
  // };
  const addSolution = async () => {
  try {
    const response = await axios.post(`${apiBaseUrl}/solutions`, {
      solution_title: newSolution.solution_title,
      solution_desc: newSolution.solution_desc,
    });

    const createdSolutionId = response.data.id;

    console.log("response", response)

    // If an issue is selected, patch it with the new solution_id
    if (selectedIssueId) {
      console.log("Selected Issue ID:", selectedIssueId);
      console.log("Created Solution ID:", createdSolutionId);
      await axios.patch(`${apiBaseUrl}/issues/${selectedIssueId}`, {
        solution_id: createdSolutionId,
      });
    }

    setSolutionDialog(false);
    window.location.reload(); // Reload the page to reflect changes
  } catch (error) {
    console.error("Failed to add solution or patch issue:", error.message);
    alert("Error occurred. Check console for details.");
  }
};



//   const filteredOrganizations = organizations.filter(Organization => {
//     return (
//       (!filters.status || Organization.status === filters.status) &&
//       (!filters.priority || Organization.priority === filters.priority) &&
//       (filters.keyword === "" || Organization.title.toLowerCase().includes(filters.keyword.toLowerCase()) || Organization.description.toLowerCase().includes(filters.keyword.toLowerCase()))
//     );
//   });

  ///ACTION BUTTONS FUNCTION
    const actionsBodyTemplate=(rowData)=>{
        const id=rowData.id
        return(

            <div className="flex align-items-center gap-2">
               
                {user && user.role!=="admin" &&(
                    <div>
                    </div>
                )}
                {user && user.role ==="admin" && (
                <>
                
                    <Button className='action-button' outlined  icon="pi pi-pen-to-square" aria-label="Εdit" onClick={()=> openEditDialog(id)}/>
                    <Button className='action-button' outlined icon="pi pi-trash" severity="danger" aria-label="delete" onClick={()=>deleteSolution(id)} />
                </>
            
                )}

            </div>
 
        );
    }

  return (
    <div className="p-4">
      <div className="flex flex-wrap align-items-center justify-content-between mb-3">
        <h2 className="m-0">Solutions</h2>
        <Button
          label="New Solution"
          icon="pi pi-plus"
          onClick={() => setSolutionDialog(true)}
        />
      </div>
      <div className="flex flex-wrap gap-3 mb-3">
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
        />
        <InputText
          value={filters.keyword}
          onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
          placeholder="Search..."
        /> */}
      </div>
      {/* <DataTable value={filteredOrganizations} paginator rows={5} className="p-datatable-sm">
        <Column field="id" header="ID" style={{ width: "4em" }} />
        <Column field="title" header="Title" />
        <Column field="status" header="Status" body={statusTemplate} />
        <Column field="priority" header="Priority" body={priorityTemplate} />
        <Column field="date" header="Reported" />
      </DataTable> */}

      <DataTable
        value={solutions}
        paginator
        rows={10}
        className="p-datatable-sm"
        scrollable
        filters={tableFilters}
        scrollHeight="600px"
        emptyMessage="No Solutions found"
      >
        <Column field="id" header="ID" style={{ width: "4em" }} />
        <Column
          field="solution_title"
          header="Title"
          style={{ minWidth: "12rem" }}
          filter
          filterPlaceholder="Search by title"
        />
        <Column
          field="solution_desc"
          header="Description"
          style={{ minWidth: "12rem" }}
          filter
          filterPlaceholder="Search by description"
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
        header="Add New Solution"
        visible={solutionDialog}
        style={{ width: "450px" }}
        modal
        className="p-fluid"
        onHide={() => setSolutionDialog(false)}
      >
        <div className="formgrid grid">
          <div className="field">
            <label htmlFor="title">Title</label>
            <InputTextarea
              id="title"
              value={newSolution.solution_title}
              onChange={(e) =>
                setNewSolution({
                  ...newSolution,
                  solution_title: e.target.value,
                })
              }
              rows={3}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="desc">Description</label>
            <InputTextarea
              id="desc"
              value={newSolution.solution_desc}
              onChange={(e) =>
                setNewSolution({
                  ...newSolution,
                  solution_desc: e.target.value,
                })
              }
              rows={3}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="issue">Select Issue</label>
            <Dropdown
              id="issue"
              value={selectedIssueId}
              options={unlinkedIssues}
              optionLabel="description" // or whatever field your issue title uses
              optionValue="id"
              onChange={(e) => setSelectedIssueId(e.value)}
              placeholder="Select an issue"
            />
          </div>
        </div>

        <div className="flex justify-content-end mt-3">
          <Button
            label="Cancel"
            icon="pi pi-times"
            className="p-button-text mr-2"
            onClick={() => setSolutionDialog(false)}
          />
          <Button
            label="Add"
            icon="pi pi-check"
            onClick={addSolution}
            autoFocus
          />
        </div>
      </Dialog>

      <Dialog
        header="Edit Solution"
        visible={editDialogVisible}
        style={{ width: "500px" }}
        modal
        className="p-fluid"
        onHide={() => setEditDialogVisible(false)}
      >
        <div className="formgrid grid">
          <div className="field col">
            <label htmlFor="title">Title</label>
            <InputTextarea
              id="title"
              value={editSolution.solution_title}
              onChange={(e) =>
                setEditSolution({
                  ...editSolution,
                  solution_title: e.target.value,
                })
              }
              rows={3}
            />
          </div>

          <div className="field col">
            <label htmlFor="desc">Description</label>
            <InputTextarea
              id="desc"
              value={editSolution.solution_desc}
              onChange={(e) =>
                setEditSolution({
                  ...editSolution,
                  solution_desc: e.target.value,
                })
              }
              rows={3}
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="edit-issue">Select Issue</label>
          <Dropdown
            id="edit-issue"
            value={selectedEditIssueId}
            options={issues}
            optionLabel="description"
            optionValue="id"
            onChange={(e) => setSelectedEditIssueId(e.value)}
            placeholder="Select an issue"
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
            onClick={updateSolution}
            autoFocus
          />
        </div>
      </Dialog>
    </div>
  );
};

export default SolutionList;
