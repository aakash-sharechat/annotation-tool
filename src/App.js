import React, { Component } from 'react';

import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { Tool } from './Tool'
import { input } from './input'
import './App.css';

export class App extends Component {
    constructor(props) {
        super(props)
        this.state = {
            source: null,
            lyrics: null,
            wordLevel: null
        }

        this.callBack = this.callBack.bind(this)
    }

    callBack(source, lyrics, wordLevel) {
        this.setState({
            source: source,
            lyrics: lyrics,
            wordLevel: wordLevel
        })
    }

    render() {
        return (
            <Switch>
                <Route path='/' exact component={input} />
                <Route path='/annotate' component={Tool} />
            </Switch>
        );
    }
}

export default App