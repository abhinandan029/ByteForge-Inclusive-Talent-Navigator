// React library imports
import { useState } from "react"

export default function  LoginPage(){

  // All the Users
  const users = [
    {label : "Employee", id : "employee"},
    {label : "HR Bussiness Partner", id : "HR"}
  ]

  // Points to active user : employee || HR and initiall none
  const [ActiveUser, setActiveUser] = useState(null)

  return (
    <div className="h-screen flex items-center justify-center">
      
      <form className="border rounded-xl flex flex-col gap-4 items-center justify-center p-10">
        
        <p>Select User Type</p>
        <div className="flex gap-8">
          {
            // Radio buttons to selsct the user
            users.map(user => {
              return (
                <div className="flex items-center gap-1">
                  <input 
                    id={user.id} 
                    type="radio"
                    name="userType"
                    value={user.id}
                    onChange={(e) => setActiveUser(e.target.value)}
                    required
                  />
                  <label htmlFor={user.id} className="cursor-pointer">{user.label}</label>
                </div>
              )
            })
          }
        </div>

        {
          // Input feilds for Employee user type
          ActiveUser === "employee" && 
          <div className="flex flex-col">
            <label>Enter Employee Id or Username</label>
            <input 
              className="border px-2"
              required
            />

            <label>Enter Password</label>
            <input 
              className="border px-2"
              required
            />
          </div>
        }

        {
          // Input feilds for HR user type
          ActiveUser === "HR" &&
          <div className="flex flex-col">
            <label>Enter Admin ID or Username</label>
            <input 
              className="border px-2"
              required
            />

            <label>Enter Password</label>
            <input 
              className="border px-2"
              required
            />
          </div> 
        }

        {
          ActiveUser && 
          <input type="submit" value="submit" className="border px-2 cursor-pointer" />
        }
        
        
      </form>
    </div>
  )
}