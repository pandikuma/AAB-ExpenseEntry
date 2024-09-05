import { useState, useEffect } from 'react';
import './Form.css';
import Select from 'react-select';

const Form = () => {
    const [date, setDate] = useState("");
    const [sitename, setSitename] = useState("");
    const [number, setNumber] = useState("");
    const [category, setCategory] = useState("");
    const [amount, setAmount] = useState("");
    const [comments, setComments] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [vendorOptions, setVendorOptions] = useState([]);
    const [contractorOptions, setContractorOptions] = useState([]);
    const [combinedOptions, setCombinedOptions] = useState([]);
    const [selectedOption, setSelectedOption] = useState(null);
    const [selectedType, setSelectedType] = useState("");

    useEffect(() => {
        fetchDropdownOptions(
            "https://backendaab.in/dashboardaab/api/expenses/vendors",
            setVendorOptions,
            "Vendor"
        );
        fetchDropdownOptions(
            "https://backendaab.in/dashboardaab/api/expenses/contractors",
            setContractorOptions,
            "Contractor"
        );
    }, []);

    useEffect(() => {
        setCombinedOptions([...vendorOptions, ...contractorOptions]);
    }, [vendorOptions, contractorOptions]);

    const handleChange = (selectedOption) => {
        setSelectedOption(selectedOption);
        if (selectedOption) {
            setSelectedType(selectedOption.type);
        } else {
            setSelectedType("");
        }
    };
    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    return (
        <div className='form-wrapper'>
            <div className='header'>
                <div className='account'>
                    <h4>Account Type</h4>
                    <select>
                        <option>Daily Wage</option>
                        <option>Weekly payment</option>
                        <option>Claim</option>
                    </select>
                </div>

                <div className='details'>
                    <label>Date</label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
                </div>

                <div className='row'>
                    <div className='column sitename'>
                        <label>Site Name</label>
                        <select value={sitename} onChange={(e) => setSitename(e.target.value)}>
                            <option>Sivakumar-Latha hotel</option>
                            <option>Saravanan-Dhanya Nagar</option>
                            <option>ESM-A.A.Nagar</option>
                        </select>
                    </div>

                    <div className="vendor-contractor-container">
                        <div className="">
                            <label className="label">Vendor/Contractor Name</label>
                            {selectedType && (
                                <span className="selected-type">{selectedType}</span>
                            )}
                        </div>
                        <div className="select-container">
                            <Select
                            styles={customStyles}
                                options={combinedOptions}
                                value={selectedOption}
                                onChange={handleChange}
                                placeholder="Select Vendor or Contractor"
                                isClearable
                                className="custom-select"
                                classNamePrefix="react-select"
                            />
                        </div>
                    </div>
                </div>
                <div className='quantity1'>
                <div className='column quantity'>
                    <label>Quantity</label>
                    <input
                        type='number'
                        value={number}
                        onChange={(e) => setNumber(e.target.value)}
                    />
                </div>
                <div className='column amount'>
                        <label>Amount</label>
                        <input
                            type='number'
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            style={{
                                WebkitAppearance: "none",
                                MozAppearance: "textfield",
                            }}
                            onWheel={(e) => e.target.blur()} // This disables the scroll behavior
                        />
                    </div>
                </div>
                {/* Swapped Category and Amount */}
                <div className='row'>
                    

                    <div className='column category'>
                        <label>Category</label>
                        <select value={category} onChange={(e) => setCategory(e.target.value)}>
                            <option>Cement</option>
                            <option>Machine Service</option>
                        </select>
                    </div>
                </div>

                <div className='forcomments'>
                    <div className='row'>
                        <div className='column comments'>
                            <label>Comments</label>
                            <input
                                className='comminput'
                                type='text'
                                placeholder='Enter Your Comments ...'
                                value={comments}
                                onChange={(e) => setComments(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div>
                <div className="flex items-center space-x-2">
                                <label
                                    htmlFor="fileInput"
                                    className="cursor-pointer flex items-center text-orange-600 rounded"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 mr-2">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16.88 3.549l4.588 4.588a2.25 2.25 0 010 3.182l-9.68 9.68a2.25 2.25 0 01-1.067.607l-5.56 1.39a.75.75 0 01-.923-.923l1.39-5.56a2.25 2.25 0 01.607-1.067l9.68-9.68a2.25 2.25 0 013.182 0zM15 5.875L18.125 9M16.5 7.5L9 15m0 0v3m0-3h3" />
                                    </svg>
                                    Attach file
                                </label>
                                <input
                                    type="file"
                                    id="fileInput"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                                {selectedFile && <span className="text-gray-600">{selectedFile.name}</span>}
                            </div>
                </div>

                {/* Moved Submit Button */}
                <div className='submit-container'>
                    <button className='submit'>Submit</button>
                </div>
            </div>
        </div>
    );
};

export default Form;

const fetchDropdownOptions = async (url, setOptions, type) => {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch ${type}: ${response.statusText}`);
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
            throw new Error(`${type} data is not an array`);
        }
        const optionsWithType = data
            .filter((item) => item && item.trim())
            .map((item, index) => ({
                label: item,
                value: `${type} - ${index}`,
                type,
            }));
        setOptions(optionsWithType);
    } catch (error) {
        console.error(`Failed to fetch ${type}: ${error.message}`);
    }
};

const customStyles = {
    control: (provided, state) => ({
      ...provided,
      borderColor: state.isFocused ? 'rgb(238, 226, 198)' : provided.borderColor,
      boxShadow: 'none', // Removes the default blue shadow
      '&:hover': {
        border:'none', // Optional: changes border color on hover
      }
    }),
  };
  
  <Select
     // Your options here
  />
  