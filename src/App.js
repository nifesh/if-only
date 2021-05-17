import './App.css';
import axios from 'axios';
import React from 'react';
import { TextField } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import moment from "moment";
import CurrencyTextField from '@unicef/material-ui-currency-textfield';
import AnimatedNumber from "animated-number-react";
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import data from './data';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';

const theme = createMuiTheme({
   palette: {
      primary: {
         light: '#757ce8',
         main: '#3f50b5',
         dark: '#002884',
         contrastText: '#fff',
      },
      secondary: {
         light: '#ff7961',
         main: '#f44336',
         dark: '#ba000d',
         contrastText: '#000',
      },
   },
});

var apiKey = process.env.REACT_APP_API_KEY
var symbols = ["AAPL", "AMD", "INTC", "TLRY", "F", "TSLA"]

data.map(x => x.date = moment(x.date).format('MM/DD/yyyy'))
data.reverse()

class App extends React.Component {
   
   state = {
      amount: 1000,
      symbol: "AAPL",
      date: moment().subtract(6, 'month').format('yyyy-MM-DD'),
      regret: 0,
      data: "",
   }

   componentDidMount() {
      this.getResult()
   }

   calculateRegret(data) {
      var investment = this.state.amount
      var priorPrice = data[0]
      var currentPrice = data[data.length - 1].high
      if (priorPrice.adj_close) {
         priorPrice = priorPrice.adj_close
      } else {
         priorPrice = priorPrice.close
      }
      console.log(investment, priorPrice, currentPrice)
      var regret = (investment / priorPrice) * currentPrice
      console.log(data)
      this.setState({
            regret,
            data
         }, this.forceUpdate )
   }
   
   getResult() {
      var priorDate = this.state.date
      var today = moment().add(1,'d').format('yyyy-MM-DD')
      if (moment(priorDate).day() === 0) {
         priorDate = moment(priorDate).subtract(2, 'd').format('yyyy-MM-DD')
      } else if (moment(priorDate).day() === 6) {
         priorDate = moment(priorDate).subtract(1, 'd').format('yyyy-MM-DD')
      }
      this.setState({
         date: priorDate
      })
      axios.get(`http://api.marketstack.com/v1/eod`, {
         params: {
            access_key: apiKey,
            symbols: this.state.symbol,
            limit: 1000,
            date_from: priorDate,
            date_to:today
         }
      }).then(res => {
         var newData = res.data.data
         newData.map(x => x.date = moment(x.date).format('MM/DD/yyyy'))
         newData.reverse()
         this.calculateRegret(newData)
      })
   }

   handleAmountChange = (event, value) => {
      this.setState(
         {
            amount: value
         }, this.getResult )
   }

   handleSymbolChange = (event, value) => {
      this.setState(
         {
            symbol: value
         }, this.getResult )
   }

   handleDateChange = (event) => {
      this.setState({
         date: event.target.value
      }, this.getResult )
   }

   render() {return (
      <div className="App">
         <div className="left">
            <header className="App-header">
               <h2>
                  IF ONLY I HAD PUT
               </h2>
               <ThemeProvider theme={theme}>
               <CurrencyTextField
                  label="Amount"
                  id="amount"
                  value={this.state.amount}
                  onBlur={(event, value) => this.handleAmountChange(event, value)}
                  />
               </ThemeProvider>
               <h2> IN </h2>
               <Autocomplete
                  id="symbol-box"
                  options={symbols}
                  getOptionLabel={(option) => option}
                  style={{ width: 300 }}
                  value={this.state.symbol}
                  type="currency"
                  renderInput={(params) => <TextField {...params} label="SYMBOL" variant="standard" />}
                  onChange={(event, value) => this.handleSymbolChange(event, value)}
               />
               <h2> ON </h2>
               <TextField
                  type="date"
                  value={this.state.date}
                  onChange={event => this.handleDateChange(event)}
               />
               <h2> TODAY I WOULD HAVE HAD </h2>
               <span>$<AnimatedNumber
                  value={this.state.regret}
                  duration={2000}
                  formatValue={(value) => value.toFixed(2)}
                  style={{color: this.state.regret > this.state.amount? "green" : "red"}}
                  className="regret"
               /></span>
            </header>
         </div>
         <div className="right App-header">
            <ResponsiveContainer width="95%" height="60%">
               <LineChart
                  title="Total Value"
                  data={this.state.data}
                  margin={{ top: 10, right: 20, bottom: 10, left: 30 }}>
                  <Line type="natural" dataKey="high" stroke="green" dot={false} />
                  <CartesianGrid stroke="#1a237e" strokeDasharray="5 5" />
                  <XAxis dataKey="date" tick={false} />
                  <YAxis domain={['dataMin - 1', 'dataMax + 1']} stroke="#1a237e" allowDecimals={false}/>
                  <Tooltip />
               </LineChart>
            </ResponsiveContainer>
         </div>
      </div>
   );
   }
}

export default App;
