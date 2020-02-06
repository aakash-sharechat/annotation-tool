import 'antd/dist/antd.css'
// import './Tool.css'
import React, { Component } from 'react'
import { Card, Button, Icon, Input, Switch } from 'antd'


const { TextArea } = Input;

export class input extends Component {
    constructor(props) {
        super(props)

        this.state = {
            source: "http://streaming.tdiradio.com:8000/house.mp3",
            duration: 0,
            rate: 1,
            currentLine: 0,
            lyrics: [],
            songName: "",
            lineActive: false,
            completed: false,
        }

        this.onChange = this.onChange.bind(this)
        this.textChange = this.textChange.bind(this)
    }

    onChange(event) {
        const file = event.target.files[0]
        const link = URL.createObjectURL(file)
        this.setState({ source: link, songName: file.name })
    }


    textChange(event) {
        const text = event.target.value
        const lines = text.split('\n').filter(line => line.length > 0)
        const lyrics = lines.map(line => ({ line: line, startTime: 0, endTime: 0 }))
        this.setState({ lyrics: lyrics, currentLine: 0, completed: false, lineActive: false })
    }



    render() {
        return (
            <div>
                <Card title="Input" style={{ width: "80%", margin: "2em auto" }} hide={true}>
                    <center>
                        <div>
                            <TextArea onChange={this.textChange} placeholder="Enter Lyrics" autoSize />
                        </div>
                        <input type='file' name='file' onChange={this.onChange} />
                        <div>
                            Word Level <Switch />
                        </div>
                        <Button type="primary" href="/annotate">Proceed <Icon type="right" /></Button>
                    </center>
                </Card>
            </div>
        );
    }
}