import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import Loader from './utils/Loader';
import Tooltip from './utils/Tooltip';
import moment from 'moment'; // Import moment for date formatting
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const Tasks = () => {
  const authState = useSelector(state => state.authReducer);
  const [tasks, setTasks] = useState([]);
  const [fetchData, { loading }] = useFetch(); // Custom hook for fetching data
  const [dueDates, setDueDates] = useState({}); // State to store due dates for each task

  // Fetch tasks from the API
  const fetchTasks = useCallback(() => {
    const config = { 
      url: "/tasks", 
      method: "get", 
      headers: { Authorization: authState.token } 
    };

    fetchData(config, { showSuccessToast: false }).then(data => {
      setTasks(data.tasks);
    }).catch(error => {
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');  // Clear the expired token
        window.location.href = "/login";  // Redirect to login page
      }
    });
  }, [authState.token, fetchData]);

  // Fetch tasks when the component mounts or when the token changes
  useEffect(() => {
    if (!authState.isLoggedIn) return;
    fetchTasks();
  }, [authState.isLoggedIn, fetchTasks]);

  const handleDelete = (id) => {
    const config = { 
      url: `/tasks/${id}`, 
      method: "delete", 
      headers: { Authorization: authState.token } 
    };
    
    fetchData(config).then(() => {
      fetchTasks();
    }).catch(error => {
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');  // Clear the expired token
        window.location.href = "/login";  // Redirect to login page
      }
    });
  };

  const handleDateChange = (taskId, date) => {
    setDueDates(prevState => ({
      ...prevState,
      [taskId]: date, // Update due date for the specific task
    }));
  };

  // Updated function to include task description when saving due date
  const handleSaveDueDate = (taskId, description) => {
    const config = { 
      url: `/tasks/${taskId}`, 
      method: "put", 
      headers: { Authorization: authState.token },
      data: { 
        dueDate: dueDates[taskId], // Use the specific task's due date
        description: description // Include description when updating
      }
    };
    
    fetchData(config).then(() => {
      fetchTasks();
      setDueDates(prevState => ({ ...prevState, [taskId]: null })); // Reset the selected date after saving
    }).catch(error => {
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');  // Clear the expired token
        window.location.href = "/login";  // Redirect to login page
      }
    });
  };

  return (
    <div className="my-2 mx-auto max-w-[700px] py-4">
      {tasks.length !== 0 && <h2 className='my-2 ml-2 md:ml-0 text-xl'>Your tasks ({tasks.length})</h2>}
      {loading ? (
        <Loader />
      ) : (
        <div>
          {tasks.length === 0 ? (
            <div className='w-[600px] h-[300px] flex items-center justify-center gap-4'>
              <span>No tasks found</span>
              <Link to="/tasks/add" className="bg-blue-500 text-white hover:bg-blue-600 font-medium rounded-md px-4 py-2">+ Add new task</Link>
            </div>
          ) : (
            tasks.map((task, index) => (
              <div key={task._id} className='bg-white my-4 p-4 text-gray-600 rounded-md shadow-md'>
                <div className='flex'>
                  <span className='font-medium'>Task #{index + 1}</span>

                  <Tooltip text={"Edit this task"} position={"top"}>
                    <Link to={`/tasks/${task._id}`} className='ml-auto mr-2 text-green-600 cursor-pointer'>
                      <i className="fa-solid fa-pen"></i>
                    </Link>
                  </Tooltip>

                  <Tooltip text={"Delete this task"} position={"top"}>
                    <span className='text-red-500 cursor-pointer' onClick={() => handleDelete(task._id)}>
                      <i className="fa-solid fa-trash"></i>
                    </span>
                  </Tooltip>
                </div>
                <div className='whitespace-pre'>{task.description}</div>

                {/* Display Due Date */}
                {task.dueDate ? (
                  <div className="mt-2 text-sm text-gray-500">
                    <strong>Due Date:</strong> {moment(task.dueDate).format('MMMM Do YYYY, h:mm a')}
                  </div>
                ) : (
                  <div className="mt-2 text-sm text-gray-500">No due date set</div>
                )}

                {/* Date Picker for Due Date */}
                <div className="mt-2">
                  <DatePicker
                    selected={dueDates[task._id]} // Use the specific task's due date
                    onChange={(date) => handleDateChange(task._id, date)} // Update the due date for the specific task
                    showTimeSelect
                    dateFormat="Pp"
                    placeholderText="Set Due Date"
                    className="border p-2 rounded"
                  />
                </div>

                <div className="mt-2">
                  <button
                    onClick={() => handleSaveDueDate(task._id, task.description)} // Pass description to save
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                  >
                    Save
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Tasks;
