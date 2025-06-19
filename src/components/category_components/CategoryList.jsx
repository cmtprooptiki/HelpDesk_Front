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

const CategoryList = () => {
      const {user} =useSelector((state)=>state.auth)

  const [filters, setFilters] = useState({ status: null, priority: null, keyword: "" });
  const [categoryDialog, setCategoryDialog] = useState(false);
  const [newCategory, setNewCategory] = useState({ description: "", status: "open", priority: "low", completed_by: "", started_by: user.name, petitioner_name: "", contact_type: "", contact_value: "", related_to_indicators: "", indicator_code: "", organizations_id: null});
  const [loading, setLoading] = useState(true);
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [currentCategoryId, setCurrentCategoryId] = useState(null);
  const [editCategory, setEditCategory] = useState({});  // prefill with same structure as newCategory
  const [categories, setCategories] = useState([]);


  // useEffect(() => {
  //   const storedCategories = JSON.parse(localStorage.getItem("Categories")) || [];
  //   setCategories(storedCategories);
  // }, []);

  /////////////////
    useEffect(()=>{
        getCategories();
        setLoading(false);
        // initFilters();
    },[]);




    ///REQUEST USERS FROM SERVER AND SET CONST
    const getCategories = async() =>{
        try {
            const response = await axios.get(`${apiBaseUrl}/categories`, {timeout: 5000});
            setCategories(response.data);

            console.log("Categories", response.data)

            // console.log("roles2",uniqueRole)
            // console.log(response.data)

            
        } catch (error) {
            console.log("Custom error message: Failed to fetch Categories");

            if (error.response && error.response.status === 403) {
                console.log("You are not authorized to view this resource.");
                alert("Access denied! Please contact an administrator.");
            } else {
                console.log("An error occurred:", error.message);
            }
        }
        
    }

  ///DELETE USER SESSION FROM SERVER  
    const deleteCategory = async(CategoryId)=>{
      console.log("Id deleted: ",CategoryId)
        await axios.delete(`${apiBaseUrl}/categories/${CategoryId}`);
        getCategories();
    }

  const openEditDialog = async (id) => {
      try {
        const response = await axios.get(`${apiBaseUrl}/categories/${id}`);
        setEditCategory(response.data);
        setCurrentCategoryId(id);
        setEditDialogVisible(true);
      } catch (error) {
        console.error("Error loading Category:", error);
        alert("Failed to load Category details.");
      }
    };


    const updateCategory = async () => {
    try {
        console.log("Id,", currentCategoryId)
      await axios.patch(`${apiBaseUrl}/categories/${currentCategoryId}`, editCategory);
      setEditDialogVisible(false);
      getCategories(); // Refresh data
    } catch (error) {
      console.error("Failed to update Category:", error);
      alert("Failed to update Category.");
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
  const addCategory = async () => {
  try {
    await axios.post(`${apiBaseUrl}/categories`, 
      {
        category_name: newCategory.category_name,
      }
    );
    setCategoryDialog(false)
    window.location.reload()
    
    // getOrganizations(); // refresh
    // setOrganizationDialog(false);
    // setNewOrganization({
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
    console.error("Failed to add Organization:", error.message);
    alert("Failed to add Organization. Check console for details.");
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

            <div className=" flex flex-wrap justify-content-center gap-3">
               
                {user && user.role!=="admin" &&(
                    <div>
                    </div>
                )}
                {user && user.role ==="admin" && (
                <span className='flex gap-1'>
                
                    <Button className='action-button' outlined  icon="pi pi-pen-to-square" aria-label="Εdit" onClick={()=> openEditDialog(id)}/>
                    <Button className='action-button' outlined icon="pi pi-trash" severity="danger" aria-label="delete" onClick={()=>deleteCategory(id)} />
                </span>
            
                )}

            </div>
 
        );
    }

  return (
    <div className="p-4">
      <div className="flex flex-wrap align-items-center justify-content-between mb-3">
        <h2 className="m-0">Organizations</h2>
        <Button
          label="New Category"
          icon="pi pi-plus"
          onClick={() => setCategoryDialog(true)}
        />
      </div>
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
        value={categories}
        paginator
        rows={10}
        className="p-datatable-sm"
        scrollable
        scrollHeight="600px"
        emptyMessage="No Categories found"
      >
        <Column field="id" header="ID" style={{ width: "4em" }} />
        <Column
          field="category_name"
          header="Category Name"
          style={{ minWidth: "12rem" }}
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
        header="Add New Category"
        visible={categoryDialog}
        style={{ width: "450px" }}
        modal
        className="p-fluid"
        onHide={() => setCategoryDialog(false)}
      >
      

        <div className="formgrid grid">
          <div className="field">
          <label htmlFor="name">Name</label>
          <InputTextarea
            id="name"
            value={newCategory.category_name}
            onChange={(e) =>
              setNewCategory({ ...newCategory, category_name: e.target.value })
            }
            rows={3}
            required
          />
        </div>
        </div>

        <div className="flex justify-content-end mt-3">
          <Button
            label="Cancel"
            icon="pi pi-times"
            className="p-button-text mr-2"
            onClick={() => setCategoryDialog(false)}
          />
          <Button label="Add" icon="pi pi-check" onClick={addCategory} autoFocus />
        </div>
      </Dialog>

      <Dialog
        header="Edit Category"
        visible={editDialogVisible}
        style={{ width: "500px" }}
        modal
        className="p-fluid"
        onHide={() => setEditDialogVisible(false)}
      >
        

        <div className="formgrid grid">
          <div className="field col">
            <label htmlFor="category_name">Category Name</label>
            <InputTextarea
            id="category_name"
            value={editCategory.category_name || ""}
            onChange={(e) =>
              setEditCategory({ ...editCategory, category_name: e.target.value })
            }
            rows={3}
          />
          </div>

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
            onClick={updateCategory}
            autoFocus
          />
        </div>
      </Dialog>
    </div>
  );
};

export default CategoryList;
