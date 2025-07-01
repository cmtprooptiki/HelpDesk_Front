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

const OrganizationList = () => {
      const {user} =useSelector((state)=>state.auth)

  const [filters, setFilters] = useState({ status: null, priority: null, keyword: "" });
  const [organizationDialog, setOrganizationDialog] = useState(false);
  const [newOrganization, setNewOrganization] = useState({ description: "", status: "open", priority: "low", completed_by: "", started_by: user.name, petitioner_name: "", contact_type: "", contact_value: "", related_to_indicators: "", indicator_code: "", organizations_id: null});
  const [loading, setLoading] = useState(true);
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [currentOrganizationId, setCurrentOrganizationId] = useState(null);
  const [editOrganization, setEditOrganization] = useState({});  // prefill with same structure as newOrganization
  const [organizations, setOrganizations] = useState([]);

  const [tableFilters, setTableFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    name: { value: null, matchMode: FilterMatchMode.CONTAINS },
    address: { value: null, matchMode: FilterMatchMode.CONTAINS },
    description: { value: null, matchMode: FilterMatchMode.CONTAINS },
    postal_code: { value: null, matchMode: FilterMatchMode.CONTAINS },
    phone_number: { value: null, matchMode: FilterMatchMode.CONTAINS },
    email: { value: null, matchMode: FilterMatchMode.CONTAINS },
    mobile_number: { value: null, matchMode: FilterMatchMode.CONTAINS },
    website: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

  // useEffect(() => {
  //   const storedOrganizations = JSON.parse(localStorage.getItem("Organizations")) || [];
  //   setOrganizations(storedOrganizations);
  // }, []);

  /////////////////
    useEffect(()=>{
        getOrganizations();
        setLoading(false);
        // initFilters();
    },[]);




    ///REQUEST USERS FROM SERVER AND SET CONST
    const getOrganizations = async() =>{
        try {
            const response = await axios.get(`${apiBaseUrl}/organizations`, {timeout: 5000});
            setOrganizations(response.data);

            console.log("Organizations", response.data)
            
            // console.log("roles2",uniqueRole)
            // console.log(response.data)

            
        } catch (error) {
            console.log("Custom error message: Failed to fetch Organizations");

            if (error.response && error.response.status === 403) {
                console.log("You are not authorized to view this resource.");
                alert("Access denied! Please contact an administrator.");
            } else {
                console.log("An error occurred:", error.message);
            }
        }
        
    }

  ///////////////////

  const statusOptions = ["open", "in-progress", "resolved"].map(s => ({ label: s.charAt(0).toUpperCase() + s.slice(1), value: s }));
  const priorityOptions = ["low", "medium", "high", "critical"].map(p => ({ label: p.charAt(0).toUpperCase() + p.slice(1), value: p }));

  ///DELETE USER SESSION FROM SERVER  
    const deleteOrganization = async(OrganizationId)=>{
      console.log("Id deleted: ",OrganizationId)
        await axios.delete(`${apiBaseUrl}/organizations/${OrganizationId}`);
        getOrganizations();
    }

  const openEditDialog = async (id) => {
      try {
        const response = await axios.get(`${apiBaseUrl}/organizations/${id}`);
        setEditOrganization(response.data);
        setCurrentOrganizationId(id);
        setEditDialogVisible(true);
      } catch (error) {
        console.error("Error loading Organization:", error);
        alert("Failed to load Organization details.");
      }
    };


    const updateOrganization = async () => {
    try {
        console.log("Id,", currentOrganizationId)
      await axios.patch(`${apiBaseUrl}/organizations/${currentOrganizationId}`, editOrganization);
      setEditDialogVisible(false);
      getOrganizations(); // Refresh data
    } catch (error) {
      console.error("Failed to update Organization:", error);
      alert("Failed to update Organization.");
    }
};

  // const saveOrganizations = (updatedOrganizations) => {
  //   localStorage.setItem("Organizations", JSON.stringify(updatedOrganizations));
  //   setOrganizations(updatedOrganizations);
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
  const addOrganization = async () => {
  try {
    await axios.post(`${apiBaseUrl}/organizations`, 
      {
        name: newOrganization.name,
        address: newOrganization.address,
        postal_code: newOrganization.postal_code,
        phone_number: newOrganization.phone_number,
        email: newOrganization.email,
        mobile_number: newOrganization.mobile_number,
        website: newOrganization.website,
        description: newOrganization.description,
      }
    );
    setOrganizationDialog(false)
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


  const filteredOrganizations = organizations.filter(Organization => {
    return (
      (!filters.status || Organization.status === filters.status) &&
      (!filters.priority || Organization.priority === filters.priority) &&
      (filters.keyword === "" || Organization.title.toLowerCase().includes(filters.keyword.toLowerCase()) || Organization.description.toLowerCase().includes(filters.keyword.toLowerCase()))
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
                    <Button className='action-button' outlined icon="pi pi-trash" severity="danger" aria-label="delete" onClick={()=>deleteOrganization(id)} />
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
          label="New Organization"
          icon="pi pi-plus"
          onClick={() => setOrganizationDialog(true)}
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
        value={filteredOrganizations}
        paginator
        rows={10}
        className="p-datatable-sm"
        filters={tableFilters}
        scrollable
        scrollHeight="600px"
        emptyMessage="No Organizations found"
        globalFilterFields={[
          "name",
          "address",
          "postal_code",
          "phone_number",
          "email",
          "mobile_number",
          "website",
          "description",
        ]}
      >
        <Column field="id" header="ID" style={{ width: "4em" }} />
        <Column
          field="name"
          header="Name"
          style={{ minWidth: "12rem" }}
          filter
          filterPlaceholder="Search by Name"
        />
        <Column
          field="address"
          header="Address"
          style={{ minWidth: "8rem" }}
          filter
          filterPlaceholder="Search by Address"
        />
        <Column
          field="postal_code"
          header="Postal Code"
          style={{ minWidth: "8rem" }}
          filter
          filterPlaceholder="Search by Postal Code"
        />
        <Column
          field="phone_number"
          header="Phone Number"
          style={{ minWidth: "10rem" }}
          filter
          filterPlaceholder="Search by Phone Number"
        />
        <Column
          field="email"
          header="Email"
          style={{ minWidth: "10rem" }}
          filter
          filterPlaceholder="Search by Email"
        />
        <Column
          field="mobile_number"
          header="Mobile Number"
          style={{ minWidth: "10rem" }}
          filter
          filterPlaceholder="Search by Mobile Number"
        />
        <Column
          field="website"
          header="Website"
          style={{ minWidth: "8rem" }}
          filter
          filterPlaceholder="Search by Website"
        />
        <Column
          field="description"
          header="Description"
          style={{ minWidth: "12rem" }}
          filter
          filterPlaceholder="Search by Description"
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
        header="Add New Organization"
        visible={organizationDialog}
        style={{ width: "450px" }}
        modal
        className="p-fluid"
        onHide={() => setOrganizationDialog(false)}
      >
      

        <div className="formgrid grid">
          <div className="field">
          <label htmlFor="name">Name</label>
          <InputTextarea
            id="name"
            value={newOrganization.name}
            onChange={(e) =>
              setNewOrganization({ ...newOrganization, name: e.target.value })
            }
            rows={3}
            required
          />
        </div>
          <div className="field col">
            <label htmlFor="address">Address</label>
            <InputText
              id="address"
              value={newOrganization.address}
              onChange={(e) =>
                setNewOrganization({ ...newOrganization, address: e.target.value })
              }
            />
          </div>
        </div>

        <div className="formgrid grid">
          <div className="field col">
            <label htmlFor="postal_code">Postal Code</label>
            <InputText
              id="postal_code"
              value={newOrganization.postal_code}
              onChange={(e) =>
                setNewOrganization({ ...newOrganization, postal_code: e.target.value })
              }
            />
          </div>
          <div className="field col">
            <label htmlFor="phone_number">Phone Number</label>
            <InputText
              id="phone_number"
              value={newOrganization.phone_number}
              onChange={(e) =>
                setNewOrganization({ ...newOrganization, phone_number: e.target.value })
              }
            />
          </div>
        </div>

        <div className="formgrid grid">
          <div className="field col">
            <label htmlFor="email">Email</label>
            <InputText
              id="email"
              value={newOrganization.email}
              onChange={(e) =>
                setNewOrganization({ ...newOrganization, email: e.target.value })
              }
            />
          </div>
          <div className="field col">
            <label htmlFor="mobile_number">Mobile Number</label>
            <InputText
              id="mobile_number"
              value={newOrganization.mobile_number}
              onChange={(e) =>
                setNewOrganization({ ...newOrganization, mobile_number: e.target.value })
              }
            />
          </div>
        </div>

        <div className="formgrid grid">
          <div className="field col">
            <label htmlFor="website">Website</label>
            <InputText
              id="website"
              value={newOrganization.website}
              onChange={(e) =>
                setNewOrganization({ ...newOrganization, website: e.target.value })
              }
            />
          </div>
            <div className="field col">
          <label htmlFor="description">Description</label>
          <InputTextarea
            id="description"
            value={newOrganization.description}
            onChange={(e) =>
              setNewOrganization({ ...newOrganization, description: e.target.value })
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
            onClick={() => setOrganizationDialog(false)}
          />
          <Button label="Add" icon="pi pi-check" onClick={addOrganization} autoFocus />
        </div>
      </Dialog>

      <Dialog
        header="Edit Organization"
        visible={editDialogVisible}
        style={{ width: "500px" }}
        modal
        className="p-fluid"
        onHide={() => setEditDialogVisible(false)}
      >
        

        <div className="formgrid grid">
          <div className="field col">
            <label htmlFor="name">Name</label>
            <InputTextarea
            id="name"
            value={editOrganization.name || ""}
            onChange={(e) =>
              setEditOrganization({ ...editOrganization, name: e.target.value })
            }
            rows={3}
          />
          </div>
          <div className="field col">
             <label htmlFor="address">Address</label>
            <InputTextarea
            id="address"
            value={editOrganization.address || ""}
            onChange={(e) =>
              setEditOrganization({ ...editOrganization, address: e.target.value })
            }
            rows={3}
          />
          </div>
        </div>

        <div className="formgrid grid">
          <div className="field col">
            <label htmlFor="postal_code">Postal Code</label>
            <InputText
              value={editOrganization.postal_code || ""}
              onChange={(e) =>
                setEditOrganization({ ...editOrganization, postal_code: e.target.value })
              }
            />
          </div>
          <div className="field col">
            <label htmlFor="phone_number">Phone Number</label>
            <InputText
              value={editOrganization.phone_number || ""}
              onChange={(e) =>
                setEditOrganization({ ...editOrganization, phone_number: e.target.value })
              }
            />
          </div>
        </div>

        <div className="formgrid grid">
          <div className="field col">
            <label htmlFor="email">Email</label>
            <InputText
              value={editOrganization.email || ""}
              onChange={(e) =>
                setEditOrganization({ ...editOrganization, email: e.target.value })
              }
            />
          </div>
          <div className="field col">
            <label htmlFor="mobile_number">Mobile Number</label>
            <InputText
              value={editOrganization.mobile_number || ""}
              onChange={(e) =>
                setEditOrganization({ ...editOrganization, mobile_number: e.target.value })
              }
            />
          </div>
        </div>

        <div className="formgrid grid">
          <div className="field col">
            <label htmlFor="website">Website</label>
            <InputText
              value={editOrganization.website || ""}
              onChange={(e) =>
                setEditOrganization({ ...editOrganization, website: e.target.value })
              }
            />
          </div>
          <div className="field">
          <label htmlFor="description">Description</label>
          <InputTextarea
            id="description"
            value={editOrganization.description || ""}
            onChange={(e) =>
              setEditOrganization({ ...editOrganization, description: e.target.value })
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
            onClick={updateOrganization}
            autoFocus
          />
        </div>
      </Dialog>
    </div>
  );
};

export default OrganizationList;
