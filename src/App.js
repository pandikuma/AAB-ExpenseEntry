import './App.css';
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router ,Route ,Routes, BrowserRouter } from 'react-router-dom'
import Topbar from './Components/Bars/Topbar';
import Heading from './Components/Heading';
import  Form  from './Components/Maincantents/Form';
import DatabaseExpenses from './Components/Maincantents/DatabaseExpenses';
import TableViewExpense from './Components/Maincantents/TableViewExpense';
import Sidebar from './Sidebar';

function App() {
  return (
    <div>
      <BrowserRouter>
      <Topbar/>
      <Sidebar/>
      <Heading/>
      <Routes>
        <Route path='/' element={<Form/>}/>
        <Route path='/expenses_database' element={<DatabaseExpenses/>}></Route>
        <Route path='/expenses_tableview' element={<TableViewExpense/>}></Route>
      </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;

