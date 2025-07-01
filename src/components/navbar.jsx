import { Menubar } from "primereact/menubar";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { LogOut } from "../features/auth_slice";
import { Button } from "primereact/button";
import apiBaseFrontUrl from "../api_front_config";
import "../../css/navbar.css"
const Navbar=()=>{
    const {user} = useSelector((state=>state.auth));
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const handleLogout = () => {
        dispatch(LogOut()).then(() => {
            navigate("/"); // ✅ Redirect after logout
        });
    };

    // Custom item template with active highlighting
    const itemTemplate = (item) => {
        const isActive = location.pathname === item.url;
        return (
            <Link
                to={item.url}
                className={`p-menuitem-link ${isActive ? "active-menu-item" : ""}`}
                style={{ display: 'flex', alignItems: 'center' }}
            >
                <span className={`p-menuitem-icon ${item.icon}`} />
                <span className="p-menuitem-text">{item.label}</span>
            </Link>
        );
    };


    const items = [
        { key:"home", label: "Home", icon: "pi pi-home",url:'/dashboard',template: itemTemplate },
        { key:"users", label: "Users", icon: "pi pi-users",url:'/users',template: itemTemplate },
        { key:"organizations", label: "Organizations", icon: "pi pi-building",url:'/organizations',template: itemTemplate },
        { key:"categories", label: "Categories", icon: "pi pi-tag",url:'/categories',template: itemTemplate },
        { key:"solutions", label: "Solutions", icon: "pi pi-key",url:'/solutions',template: itemTemplate },
        { key:"reports", label: "Reports", icon: "pi pi-calendar-clock",url:'/reports',template: itemTemplate },


    ];
    const end=[
        <div key="right-side-btns" className="flex gap-1">
            <span  className="p-text-secondary p-text-bold">
                {user? (
                    <Link  to={`${apiBaseFrontUrl}/users/edit/${user.uuid}`}>
                        <Button className="p-button-sm" outlined icon="pi pi-user ">{user.name}</Button>
                    </Link>):('')}
            </span>
            <Button 
            outlined
            //label="Logout" 
            icon="pi pi-sign-out" 
            className="p-button-danger p-button-sm" 
            onClick={handleLogout} 
            />
        </div>
    ]
    return(
    <Menubar model={items} end={end}/>
    );
}
export default Navbar;
