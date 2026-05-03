'use client'

import axios from 'axios'
import { useEffect, useState } from 'react'

const Page = () => {
  const [children, setChildren] = useState([
    {
      FirstName: 'John',
      LastName: 'Doe',
      BirthDate: '2015-05-12',
      Email: 'john@example.com',
      Gender: 'Male',
      Spend: 250.5,
      Balance: 500.0,
    },
  ])

  const [showForm, setShowForm] = useState(false)

  const [allchild,setAllChild]=useState([]);

  const [formData, setFormData] = useState({
    FirstName: '',
    LastName: '',
    BirthDate: '',
    Email: '',
    Password: '',
    ConfirmPassword: '',
    Gender: '',
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

useEffect(() => {
  

  return () => {

    const GetAllChil=async()=>{
         try {

          const child= await axios.get("http://localhost:5080/api/Parent/GetAllChil",{withCredentials:true})

          setAllChild(child.data.allchildinquary)
          console.log(allchild);
          
          
         
           }
            
      catch (error) {
    
          }
      }
    GetAllChil();

    
  }
}, [])
console.log(allchild);




const handleAddChild = async (e) => {
  e.preventDefault()

  if (
    !formData.FirstName ||
    !formData.LastName ||
    !formData.BirthDate ||
    !formData.Email ||
    !formData.Password ||
    !formData.ConfirmPassword ||
    !formData.Gender
  ) {
    alert('Please fill all fields')
    return
  }

  if (formData.Password !== formData.ConfirmPassword) {
    alert('Passwords do not match')
    return
  }

  try {
    const user = await axios.post(
      "http://localhost:5080/api/User/childRegistration",
      {
        firstName: formData.FirstName,
        lastName: formData.LastName,
        birthDate: formData.BirthDate,
        email: formData.Email,
        gender: formData.Gender,
        password:formData.Password
      },
      { withCredentials: true }
    )

    if (user.status === 200 || user.status === 201) {
      window.location.reload()
    }

    setChildren((prev) => [...prev, newChild])

    setFormData({
      FirstName: '',
      LastName: '',
      BirthDate: '',
      Email: '',
      Password: '',
      ConfirmPassword: '',
      Gender: '',
    })

    setShowForm(false)

  } catch (error) {
    console.log('Status:', error.response?.status)
    console.log('Backend error:', error.response?.data)
  }
}



  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Children Management
        </h1>

        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg cursor-pointer"
        >
          + Add Child
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allchild.map((child) => (
          <div key={child.id} className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold">
              {child.name} 
            </h2>

            <p className="text-sm text-gray-500 mb-4">{child.Gender}</p>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Spend:</span>
                <span className="text-red-600 font-semibold">
                  {/* ${child.Spend.toFixed(2)} */} 00
                </span>
              </div>

              <div className="flex justify-between">
                <span>Balance:</span>
                <span className="text-green-600 font-semibold">
                  {/* ${child.Balance.toFixed(2)} */} 00
                </span>
              </div>
            </div>

            <div className="mt-4 text-sm">
              <p>Email: {child.Email}</p>
              <p>
                Birth Date:{' '}
                {new Date(child.BirthDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-blue-600 text-white p-6 flex justify-between items-center">
              <h2 className="text-xl font-bold">Add Child</h2>

              <button
                type="button"
                className="cursor-pointer"
                onClick={() => setShowForm(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddChild} className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  name="FirstName"
                  value={formData.FirstName}
                  onChange={handleInputChange}
                  placeholder="First Name"
                  className="border p-2 rounded"
                />

                <input
                  name="LastName"
                  value={formData.LastName}
                  onChange={handleInputChange}
                  placeholder="Last Name"
                  className="border p-2 rounded"
                />
              </div>

              <input
                type="date"
                name="BirthDate"
                value={formData.BirthDate}
                onChange={handleInputChange}
                className="border p-2 rounded w-full"
              />

              <input
                type="email"
                name="Email"
                value={formData.Email}
                onChange={handleInputChange}
                placeholder="Email"
                className="border p-2 rounded w-full"
              />

              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="password"
                  name="Password"
                  value={formData.Password}
                  onChange={handleInputChange}
                  placeholder="Password"
                  className="border p-2 rounded"
                />

                <input
                  type="password"
                  name="ConfirmPassword"
                  value={formData.ConfirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm Password"
                  className="border p-2 rounded"
                />
              </div>

              <select
                name="Gender"
                value={formData.Gender}
                onChange={handleInputChange}
                className="border p-2 rounded w-full"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 cursor-pointer bg-gray-300 py-2 rounded"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex-1 cursor-pointer bg-blue-600 text-white py-2 rounded"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Page