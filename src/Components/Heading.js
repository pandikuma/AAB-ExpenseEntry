import React, { useState } from "react";
import './Heading.css'
import { Link, useLocation } from "react-router-dom";

const Heading = () => {
    const location = useLocation();
    const [activeLink, setActiveLink] = useState(location.pathname);

    const handleLinkClick = (path) => {
        setActiveLink(path);
    };

  return (
    <div>
        <div className="topbar-title">
                <h3>
                    <Link
                        className={`link ${activeLink === '/' ? 'active' : ''}`}
                        to='/'
                        onClick={() => handleLinkClick('/')}
                    >
                        Form
                    </Link>
                </h3>
                <h3>
                    <Link
                        className={`link ${activeLink === '/expenses_tableview' ? 'active' : ''}`}
                        to='/expenses_tableview'
                        onClick={() => handleLinkClick('/expenses_tableview')}
                    >
                        Tableview
                    </Link>
                </h3>
                <h3>
                    <Link
                        className={`link ${activeLink === '/expenses_database' ? 'active' : ''}`}
                        to='/expenses_database'
                        onClick={() => handleLinkClick('/expenses_database')}
                    >
                        Database
                    </Link>
                </h3>
            </div>
    </div>
  )
}

export default Heading