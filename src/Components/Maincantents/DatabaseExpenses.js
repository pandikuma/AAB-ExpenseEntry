import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import Modal from 'react-modal';
import edit from '../Images/edit.png';
import history from '../Images/history.png';
import remove from '../Images/delete.png';
import clear from '../Images/dust.png';
import Swal from 'sweetalert2';
Modal.setAppElement('#root');
const DatabaseExpenses = ({ username }) => {
    const [expenses, setExpenses] = useState([]);
    const [filteredExpenses, setFilteredExpenses] = useState([]);
    const [editId, setEditId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedExpenseId, setSelectedExpenseId] = useState(null);
    const [audits, setAudits] = useState([]);
    const [siteOptions, setSiteOptions] = useState([]);
    const [vendorOptions, setVendorOptions] = useState([]);
    const [contractorOptions, setContractorOptions] = useState([]);
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [machineToolsOptions, setMachineToolsOptions] = useState([]);
    useEffect(() => {
        // Fetch dropdown options
        const fetchDropdownOptions = async (url, setOptions, optionName) => {
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error(`Failed to fetch ${optionName}`);
                const data = await response.json();
                setOptions(data);
            } catch (error) {
                console.error(`Error fetching ${optionName}:`, error);
            }
        };

        fetchDropdownOptions("https://backendaab.in/dashboardaab/api/expenses/sites", setSiteOptions, "site names");
        fetchDropdownOptions("https://backendaab.in/dashboardaab/api/expenses/vendors", setVendorOptions, "vendor names");
        fetchDropdownOptions("https://backendaab.in/dashboardaab/api/expenses/contractors", setContractorOptions, "contractor names");
        fetchDropdownOptions("https://backendaab.in/dashboardaab/api/expenses/categories", setCategoryOptions, "categories");
        fetchDropdownOptions("https://backendaab.in/dashboardaab/api/expenses/machine-tools", setMachineToolsOptions, "machine tools");
    }, []);
    const [formData, setFormData] = useState({
        accountType: '',
        date: '',
        siteName: '',
        vendor: '',
        quantity: '',
        contractor: '',
        amount: '',
        category: '',
        otherVendorName: '',
        otherContractorName: '',
        machineTools: '',
        billCopy: ''
    });
    const [filters, setFilters] = useState({
        siteName: null,
        vendor: null,
        category: null,
        contractor: null,
        startDate: '',
        endDate: ''
    });
    const [options, setOptions] = useState({
        siteNames: [],
        vendors: [],
        categories: [],
        contractors: []
    });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;
    const [modalIsOpen, setModalIsOpen] = useState(false);
    useEffect(() => {
        axios.get('https://backendaab.in/aabdash/expenses_form/get_form')
            .then(response => {
                const sortedExpenses = response.data.sort((a, b) => new Date(b.date) - new Date(a.date));
                setExpenses(sortedExpenses);
                setFilteredExpenses(sortedExpenses);
                extractFilterOptions(sortedExpenses);
            })
            .catch(error => {
                console.error('Error fetching expenses:', error);
            });
    }, []);
    const extractFilterOptions = (expenses) => {
        const siteNames = Array.from(new Set(expenses.map(expense => expense.siteName)));
        const vendors = Array.from(new Set(expenses.map(expense => expense.vendor)));
        const categories = Array.from(new Set(expenses.map(expense => expense.category)));
        const contractors = Array.from(new Set(expenses.map(expense => expense.contractor)));

        setOptions({
            siteNames: siteNames.map(name => ({ value: name, label: name })),
            vendors: vendors.map(name => ({ value: name, label: name })),
            categories: categories.map(name => ({ value: name, label: name })),
            contractors: contractors.map(name => ({ value: name, label: name }))
        });
    };
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };
    const formatDateOnly = (dateString) => {
        const date = new Date(dateString);

        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        const year = date.getFullYear();

        return `${day}/${month}/${year}`; // Formats the date to DD/MM/YYYY
    };
    useEffect(() => {
        let filteredData = expenses;
        if (filters.siteName) {
            filteredData = filteredData.filter(expense =>
                expense.siteName === filters.siteName.value
            );
        }
        if (filters.vendor) {
            filteredData = filteredData.filter(expense =>
                expense.vendor === filters.vendor.value
            );
        }
        if (filters.category) {
            filteredData = filteredData.filter(expense =>
                expense.category === filters.category.value
            );
        }
        if (filters.contractor) {
            filteredData = filteredData.filter(expense =>
                expense.contractor === filters.contractor.value
            );
        }
        if (filters.startDate) {
            filteredData = filteredData.filter(expense =>
                new Date(expense.date) >= new Date(filters.startDate)
            );
        }
        if (filters.endDate) {
            filteredData = filteredData.filter(expense =>
                new Date(expense.date) <= new Date(filters.endDate)
            );
        }
        setFilteredExpenses(filteredData);
        setCurrentPage(1);
    }, [filters, expenses]);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredExpenses.slice(indexOfFirstItem, indexOfLastItem);
    const handlePageChange = (direction) => {
        if (direction === 'next' && indexOfLastItem < filteredExpenses.length) {
            setCurrentPage(currentPage + 1);
        } else if (direction === 'prev' && currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };
    const handleEditClick = (expense) => {
        setEditId(expense.id);
        setFormData(expense);
        setModalIsOpen(true);
    };
    const handleFilterChange = (selectedOption, action) => {
        let updatedValue = selectedOption;
        // Format the date value to "yyyy-MM-dd" if the action is related to a date filter
        if (action.name === 'startDate' || action.name === 'endDate') {
            updatedValue = selectedOption.value;
        }
        setFilters({
            ...filters,
            [action.name]: updatedValue
        });
    };
    const handleSave = () => {
        axios.put(`https://backendaab.in/aabdash/expenses_form/update/${editId}`, formData, {
            params: { editedBy: username } // Pass username as `editedBy`
        })
            .then(response => {
                setExpenses(expenses.map(exp => (exp.id === editId ? { ...exp, ...formData } : exp)));
                setModalIsOpen(false);
            })
            .catch(error => {
                console.error('Error updating expense:', error);
            });
    };
    // Function to handle clearing all data for a given row
    const handleClearAll = (expenseId) => {
        // Display a SweetAlert2 confirmation dialog
        Swal.fire({
            title: 'Are you sure?',
            text: 'Do you really want to clear all data for this expense?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No',
            customClass: {
                confirmButton: 'bg-red-500 text-white px-4 py-2 rounded',
                cancelButton: 'bg-gray-300 text-gray-700 px-4 py-2 rounded ml-2',
                title: 'text-lg font-semibold',
                popup: 'p-6 rounded-lg shadow-lg',
            },
        }).then((result) => {
            if (result.isConfirmed) {
                // If the user confirms, proceed to clear the expense data
                // Find the expense to clear
                const updatedExpense = expenses.find(exp => exp.id === expenseId);
                // Set all relevant fields to empty strings
                const clearedExpense = {
                    ...updatedExpense,
                    siteName: '',
                    vendor: '',
                    contractor: '',
                    quantity: '',
                    amount: '',
                    category: '',
                    accountType: '',
                    machineTools: '',
                    billCopy: '',
                };
                // Update the state with the modified expenses list
                setExpenses(expenses.map(exp => (exp.id === expenseId ? clearedExpense : exp)));
                // Update the backend to reflect the cleared data
                axios.put(`https://backendaab.in/aabdash/expenses_form/update/${expenseId}`, clearedExpense, {
                    params: { editedBy: username } // Pass username as `editedBy`
                })
                    .then(response => {
                        console.log('Expense cleared successfully');
                        Swal.fire('Cleared!', 'Your data has been cleared.', 'success');
                    })
                    .catch(error => {
                        console.error('Error clearing expense:', error);
                        Swal.fire('Error!', 'There was a problem clearing the data.', 'error');
                    });
            }
        });
    };
    const handleCancel = () => {
        setModalIsOpen(false);
    };
    const fetchAuditDetails = async (expenseId) => {
        try {
            const response = await fetch(`https://backendaab.in/aabdash/expenses_form/audit/${expenseId}`);
            const data = await response.json();
            setAudits(data);
            setSelectedExpenseId(expenseId);
            console.log(selectedExpenseId)
            setShowModal(true);
        } catch (error) {
            console.error("Error fetching audit details:", error);
        }
    };
    const handleClearFilters = () => {
        setFilters({
            siteName: null,
            vendor: null,
            contractor: null,
            category: null,
            startDate: '',
            endDate: '',
        });
    };
    return (
        <div className="mx-auto p-4 bg-orange-50">
            <div>
            <div className=" flex mb-2">
                <div className=' w-72 mr-1'>
                    <Select
                        name="siteName"
                        options={options.siteNames}
                        value={filters.siteName}
                        onChange={handleFilterChange}
                        placeholder="Filter by Site Name"
                        isClearable
                    />
                </div>
                <div className=' w-72 mr-1'>
                    <Select
                        name="vendor"
                        options={options.vendors}
                        value={filters.vendor}
                        onChange={handleFilterChange}
                        placeholder="Filter by Vendor"
                        isClearable
                    />
                </div>
                <div className=' w-72 mr-1'>
                    <Select
                        name="contractor"
                        options={options.contractors}
                        value={filters.contractor}
                        onChange={handleFilterChange}
                        placeholder="Filter by Contractor"
                        isClearable
                    />
                </div>
                <div className=' mr-1 w-72'>
                    <Select
                        name="category"
                        options={options.categories}
                        value={filters.category}
                        onChange={handleFilterChange}
                        placeholder="Filter by Category"
                        isClearable
                    />
                </div>
                <div className=' -ml-1'>
                    <input
                        type="date"
                        name="startDate"
                        value={filters.startDate || ''} // Ensure a string is passed
                        onChange={(e) => handleFilterChange({ value: e.target.value }, { name: 'startDate' })}
                        className="p-2 border border-gray-300 rounded h-9  ml-4"
                    />
                </div>
                <div className=' '>
                    <input
                        type="date"
                        name="endDate"
                        value={filters.endDate || ''} // Ensure a string is passed
                        onChange={(e) => handleFilterChange({ value: e.target.value }, { name: 'endDate' })}
                        className="p-2 border border-gray-300 rounded h-9 ml-4"
                    />
                </div>
                <div className='ml-4'>
                    <button
                        onClick={handleClearFilters}
                    >
                        <img src={clear}
                            alt='clear'
                            className=" w-12 h-7 transform hover:scale-110 hover:brightness-110 transition duration-200 "/>
                    </button>
                </div>
            </div>
            <table className="min-w-full border border-gray-200">
                <thead className=' bg-orange-50 '>
                    <tr>
                        <th className="px-4 w-40">Timestamp</th>
                        <th className="px-4 w-24">Date</th>
                        <th className="px-4 w-40">Site Name</th>
                        <th className="px-4 w-28">Vendor</th>
                        <th className="px-4 w-32">Contractor</th>
                        <th className="px-4 w-8">Quantity</th>
                        <th className="px-4 w-8">Amount</th>
                        <th className="px-4 w-12">Category</th>
                        <th className="px-4 w-6">E No</th>
                        <th className="px-4 w-4">Account_Type</th>
                        <th className="px-4 w-2">Machine Tools</th>
                        <th className="px-4 w-6">Bill Copy</th>
                        <th className="px-4 w-20">Edit</th>
                    </tr>
                </thead>
                <tbody>
                    {currentItems.map((expense, index) => (
                        <tr key={expense.id} className='odd:bg-white even:bg-orange-50'>
                            <td className="px-4 text-sm">{formatDate(expense.timestamp)}</td>
                            <td className="px-4 text-sm">{formatDateOnly(expense.date)}</td>
                            <td className="px-4 text-sm">{expense.siteName}</td>
                            <td className="px-4 text-sm">{expense.vendor}</td>
                            <td className="px-4 text-sm">{expense.contractor}</td>
                            <td className="px-4 text-sm">{expense.quantity}</td>
                            <td className="px-4 text-sm">{parseInt(expense.amount, 10).toLocaleString()}</td>
                            <td className="px-4 text-sm">{expense.category}</td>
                            <td className="px-4 text-sm">{expense.eno}</td>
                            <td className="px-4 text-sm">{expense.accountType}</td>
                            <td className="px-4 text-sm">{expense.machineTools}</td>
                            <td className="px-4 text-sm">
                                {expense.billCopy ? (
                                    <a href={expense.billCopy} className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">
                                        Bill Copy
                                    </a>
                                ) : (
                                    <span className="text-red-500">No Bill</span>
                                )}
                            </td>
                            <td className=" flex w-20 justify-between py-2">
                                <button
                                    onClick={() => handleEditClick(expense)}
                                    className="hover:bg-red-200 rounded-full transition duration-200 ml-2 mr-3"
                                >
                                    <img
                                        src={edit}
                                        alt="Edit"
                                        className=" w-4 h-6 transform hover:scale-110 hover:brightness-110 transition duration-200 "
                                    />
                                </button>
                                <button
                                    className=" -ml-5 -mr-2"
                                    onClick={() => handleClearAll(expense.id)}
                                >
                                    <img
                                        src={remove}
                                        alt='delete'
                                        className='  w-4 h-5 transform hover:scale-110 hover:brightness-110 transition duration-200 ' />
                                </button>
                                <button
                                    onClick={() => fetchAuditDetails(expense.id)}
                                    className="rounded-full transition duration-200 -mr-1"
                                >
                                    <img
                                        src={history}
                                        alt="history"
                                        className=" w-4 h-5 transform hover:scale-110 hover:brightness-110 transition duration-200 "
                                    />
                                </button>
                            </td>


                        </tr>
                    ))}
                </tbody>
            </table>
            {/* Pagination Controls */}
            <div className="mt-4 flex justify-center items-center">
                <button
                    onClick={() => handlePageChange('prev')}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
                >
                    Previous
                </button>
                <span className="text-lg">
                    Page {currentPage} of {Math.ceil(filteredExpenses.length / itemsPerPage)}
                </span>
                <button
                    onClick={() => handlePageChange('next')}
                    disabled={indexOfLastItem >= filteredExpenses.length}
                    className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
                >
                    Next
                </button>
            </div>
            {/* Modal for editing expense */}
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={handleCancel}
                contentLabel="Edit Expense"
                className="fixed inset-0 flex items-center justify-center p-4 bg-gray-800 bg-opacity-50"
                overlayClassName="fixed inset-0"
            >
                <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-96 max-h-[80vh] overflow-y-auto sm:w-11/12 sm:max-w-xl">
                    <h2 className="text-xl font-bold mb-4">Edit Expense</h2>
                    <form>
                        <div className="mb-4">
                            <label htmlFor="date" className="block text-gray-700">Date</label>
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                className="mt-1 block w-full p-2 border border-gray-300 rounded"
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="siteName" className="block text-gray-700">Site Name</label>
                            <select
                                name="siteName"
                                value={formData.siteName} // This is the selected value
                                onChange={handleChange}
                                className="mt-1 block w-full p-2 border border-gray-300 rounded"
                            >
                                {/* Dynamically generate dropdown options from the siteName list */}
                                {siteOptions
                                    .filter(site => site !== null && site !== '')
                                    .map((site, index) => (
                                        <option key={index} value={site}>
                                            {site}
                                        </option>
                                    ))}
                            </select>
                        </div>
                        <div className="mb-4">
                            <label htmlFor="vendor" className="block text-gray-700">Vendor</label>
                            <select
                                name="vendor"
                                value={formData.vendor}
                                onChange={handleChange}
                                className="mt-1 block w-full p-2 border border-gray-300 rounded"
                            >
                                {vendorOptions
                                    .filter(vendor => vendor !== null && vendor !== '')
                                    .map((vendor, index) => (
                                        <option key={index} value={vendor}>
                                            {vendor}
                                        </option>
                                    ))}
                            </select>
                        </div>
                        <div className="mb-4">
                            <label htmlFor="contractor" className="block text-gray-700">Contractor</label>
                            <select
                                name="contractor"
                                value={formData.contractor}
                                onChange={handleChange}
                                className="mt-1 block w-full p-2 border border-gray-300 rounded"
                            >
                                {contractorOptions
                                    .filter(contractor => contractor !== null && contractor !== '')
                                    .map((contractor, index) => (
                                        <option key={index} value={contractor}>
                                            {contractor}
                                        </option>
                                    ))}
                            </select>
                        </div>
                        <div className="mb-4">
                            <label htmlFor="quantity" className="block text-gray-700">Quantity</label>
                            <input
                                type="text"
                                name="quantity"
                                value={formData.quantity}
                                onChange={handleChange}
                                className="mt-1 block w-full p-2 border border-gray-300 rounded"
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="amount" className="block text-gray-700">Amount</label>
                            <input
                                type="number"
                                name="amount"
                                value={formData.amount}
                                onChange={handleChange}
                                className="mt-1 block w-full p-2 border border-gray-300 rounded"
                                style={{
                                    WebkitAppearance: "none",
                                    MozAppearance: "textfield",
                                }}
                                onWheel={(e) => e.target.blur()} // This disables the scroll behavior
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="category" className="block text-gray-700">Category</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="mt-1 block w-full p-2 border border-gray-300 rounded"
                            >
                                {categoryOptions
                                    .filter(category => category !== null && category !== '')
                                    .map((category, index) => (
                                        <option key={index} value={category}>
                                            {category}
                                        </option>
                                    ))}
                            </select>
                        </div>
                        <div className="mb-4">
                            <label htmlFor="otherContractorName" className="block text-gray-700">Account_Type</label>
                            <input
                                type="text"
                                name="accountType"
                                value={formData.accountType}
                                onChange={handleChange}
                                className="mt-1 block w-full p-2 border border-gray-300 rounded"
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="machineTools" className="block text-gray-700">Machine Tools</label>
                            <select
                                name="machineTools"
                                value={formData.machineTools}
                                onChange={handleChange}
                                className="mt-1 block w-full p-2 border border-gray-300 rounded"
                            >
                                {machineToolsOptions
                                    .filter(machineTools => machineTools !== null && machineTools !== '')
                                    .map((machineTools, index) => (
                                        <option key={index} value={machineTools}>
                                            {machineTools}
                                        </option>
                                    ))}
                            </select>
                        </div>
                        <div className="mb-4">
                            <label htmlFor="billCopy" className="block text-gray-700">Bill Copy URL</label>
                            <input
                                type="text"
                                name="billCopy"
                                value={formData.billCopy}
                                onChange={handleChange}
                                className="mt-1 block w-full p-2 border border-gray-300 rounded"
                            />
                        </div>
                        <div className="flex justify-end space-x-4">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSave}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                Save
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
            {/* Audit Modal */}
            <AuditModal show={showModal} onClose={() => setShowModal(false)} audits={audits} />
            </div>
        </div>
    );
};
export default DatabaseExpenses;

// Helper function to format the date and time in 12-hour format with AM/PM and adjust time zone
const formatDate = (dateString) => {
    const date = new Date(dateString);

    // Add 5 hours and 30 minutes (330 minutes in total) to the time
    date.setMinutes(date.getMinutes() + 330);

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';

    // Convert to 12-hour format
    hours = hours % 12;
    hours = hours ? String(hours).padStart(2, '0') : '12'; // the hour '0' should be '12'

    return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`; // Formats the date to DD/MM/YYYY HH:MM AM/PM
};


const AuditModal = ({ show, onClose, audits }) => {
    if (!show) return null;
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg shadow-lg w-11/12 sm:w-3/4 max-w-2xl mx-4 p-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-700">Expenses Edited History</h2>
                </div>
                {/* Set a max height and overflow-y for the table container */}
                <div className="overflow-y-auto mt-4 max-h-80 overflow-x-auto">
                    <table className="min-w-full bg-white">
                        <thead className="bg-red-100">
                            <tr>
                                <th className="border-b px-1 py-2 text-left text-sm font-medium text-gray-700">Field Name</th>
                                <th className="border-b px-1 py-2 text-left text-sm font-medium text-gray-700">Old Value</th>
                                <th className="border-b px-1 py-2 text-left text-sm font-medium text-gray-700">New Value</th>
                                <th className="border-b px-1 py-2 text-left text-sm font-medium text-gray-700">Edited By</th>
                                <th className="border-b px-1 py-2 text-left text-sm font-medium text-gray-700">Edited Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {audits.map((audit, index) => (
                                <tr key={index} className="odd:bg-white even:bg-red-200">
                                    <td className="border-b border-r px-1 py-2 text-sm text-gray-600">{audit.fieldName}</td>
                                    <td className="border-b border-r px-1 py-2 text-sm text-gray-600" style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}>
                                        {audit.oldValue}
                                    </td>
                                    <td className="border-b border-r px-1 py-2 text-sm text-gray-600" style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}>
                                        {audit.newValue}
                                    </td>
                                    <td className="border-b border-r px-1 py-2 text-sm text-gray-600">{audit.editedBy}</td>
                                    <td className="border-b px-1 py-2 text-sm text-gray-600">{formatDate(audit.editedDate)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="flex justify-end mt-4">
                    <button
                        onClick={onClose}
                        className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-300"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};