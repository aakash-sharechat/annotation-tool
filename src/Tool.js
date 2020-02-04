import 'antd/dist/antd.css'
// import './Tool.css'
import React, { Component } from 'react'
import { Typography, Card, Slider, InputNumber, Row, Col, Input, Button, Icon } from 'antd'
import { CSVLink } from "react-csv"

const { Title } = Typography;
const { TextArea } = Input;
const faded = { color: "rgba(0, 0, 0, 0.5)" }

export class Tool extends Component {
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

        this.mark = this.mark.bind(this)
        this.prev = this.prev.bind(this)
        this.validIndex = this.validIndex.bind(this)
        this.annotateElement = this.annotateElement.bind(this)
        this.reset = this.reset.bind(this)
        this.silent = this.silent.bind(this)
        this.onChange = this.onChange.bind(this)
        this.textChange = this.textChange.bind(this)
        this.changeRate = this.changeRate.bind(this)
    }

    onChange(event) {
        const file = event.target.files[0]
        const link = URL.createObjectURL(file)
        this.setState({ source: link, songName: file.name })
    }

    mark() {
        console.log(this.state.lyrics)

        const time = Math.floor(this.audio.currentTime * 1000)
        let lineIndex = this.state.currentLine
        let lineActive = false
        let completed = false

        let lyrics = this.state.lyrics
        if (this.state.lineActive && this.state.currentLine > 0) {
            lyrics[this.state.currentLine - 1].endTime = Math.max(lyrics[this.state.currentLine - 1].startTime, time - 1)
            completed = this.state.currentLine == this.state.lyrics.length
        }
        if (this.state.currentLine < this.state.lyrics.length) {
            lyrics[this.state.currentLine].startTime = time
            lyrics[this.state.currentLine].endTime = time
            lineIndex++
            lineActive = true
        }
        this.setState({ lyrics: lyrics, currentLine: lineIndex, lineActive: lineActive, completed: completed })
    }

    silent() {
        console.log(...this.state.lyrics)

        const time = Math.floor(this.audio.currentTime * 1000)
        let completed = false
        let lyrics = this.state.lyrics
        if (this.state.lineActive && this.state.currentLine > 0) {
            lyrics[this.state.currentLine - 1].endTime = Math.max(lyrics[this.state.currentLine - 1].startTime, time)
            completed = this.state.currentLine == this.state.lyrics.length
        }
        this.setState({ lyrics: lyrics, lineActive: false, completed: completed })
    }

    reset() {
        let lyrics = this.state.lyrics
        for (let i = 0; i < lyrics.length; i++) {
            lyrics[i].startTime = 0
            lyrics[i].endTime = 0
        }
        this.audio.pause()
        this.audio.currentTime = 0
        this.setState({ lyrics: lyrics, currentLine: 0 })
    }

    textChange(event) {
        const text = event.target.value
        const lines = text.split('\n')
        const lyrics = lines.map(line => ({ line: line, startTime: 0, endTime: 0 }))
        this.setState({ lyrics: lyrics })
    }

    changeRate(rate) {
        this.setState({ rate: rate })
        this.audio.playbackRate = rate
    }

    prev() {
        let lyrics = this.state.lyrics
        let currentLine = this.state.currentLine
        if (this.state.currentLine < lyrics.length) {
            lyrics[currentLine].startTime = 0
            lyrics[currentLine].endTime = 0
        }
        currentLine--
        lyrics[currentLine].startTime = 0
        lyrics[currentLine].endTime = 0
        this.audio.currentTime -= 3
        this.setState({ lyrics: lyrics, currentLine: currentLine, lineActive: false, completed: false })
    }

    validIndex(ind) {
        const fadeText = ind != this.state.currentLine
        let valid = this.state.lyrics.length > 0
        valid &= ind >= 0
        valid &= ind < this.state.lyrics.length
        if (valid) {
            return (
                <Title
                    style={fadeText ? faded : {}}
                    onClick={fadeText ? () => { } : this.mark}
                >
                    {this.state.lyrics[ind].line}
                </Title>
            )
        }
        return null
    }

    annotateElement() {
        if (this.state.lyrics.length == 0) {
            return <Title>Please add lyrics</Title>
        }
        if (this.state.completed)
            return <Title>Lyrics Completed!</Title>
        return (
            <div>
                {this.validIndex(this.state.currentLine - 1, true)}
                {
                    this.state.lineActive ?
                        <Button type="dashed" onClick={this.silent} disabled={this.state.lyrics.length === 0}>Silence</Button>
                        : null
                }
                {this.validIndex(this.state.currentLine)}
                {
                    this.state.lineActive ?
                        <Button type="dashed" onClick={this.silent} disabled={this.state.lyrics.length === 0}>Silence</Button>
                        : null
                }
                {this.validIndex(this.state.currentLine + 1, true)}
            </div>
        )
    }

    render() {
        const faded = { color: "rgba(0, 0, 0, 0.5)" }
        let line = "Please enter lyrics to continue", start = 0, end = 0
        if (this.state.currentLine < this.state.lyrics.length) {
            line = this.state.lyrics[this.state.currentLine].line
            start = this.state.lyrics[this.state.currentLine].startTime
            end = this.state.lyrics[this.state.currentLine].endTime
        }

        return (
            <div>
                <Card title="Input" style={{ width: "80%", margin: "2em auto" }} hide={true}>
                    <center>
                        <div>
                            <TextArea onChange={this.textChange} placeholder="Enter Lyrics" autoSize />
                        </div>
                        <input type='file' name='file' onChange={this.onChange} />
                    </center>
                </Card>
                <Card title="Audio" style={{ width: "80%", margin: "2em auto" }}>
                    <center >
                        <audio ref={(a) => this.audio = a} src={this.state.source} style={{ width: "80%", margin: 'auto' }} controls>
                            Test
                        </audio>
                    </center    >

                    <Card title="Rate" type="inner" style={{ width: "80%", margin: "auto" }}>

                        <Row>
                            <Col span={16}>
                                <Slider
                                    min={0.5}
                                    max={2}
                                    step={0.01}
                                    marks={{ 1: '1.0' }}
                                    value={this.state.rate}
                                    onChange={this.changeRate}
                                />
                            </Col>
                            <Col span={4}>
                                <InputNumber
                                    min={0.5}
                                    max={2}
                                    step={0.1}
                                    style={{ margin: 16 }}
                                    value={this.state.rate}
                                    onChange={this.changeRate}
                                />
                            </Col>
                        </Row>
                    </Card>
                </Card>


                <Card title="Lyrics" style={{ width: "80%", margin: "1em auto" }}>

                    <center>
                        {this.annotateElement()}
                    </center>

                    <center>
                        <Button style={{ margin: "1em" }} type="primary" onClick={this.mark} disabled={this.state.lyrics.length === 0}>Mark</Button>
                        <Button style={{ margin: "1em" }} type="danger" onClick={this.reset} disabled={this.state.lyrics.length === 0}>Reset</Button>
                        <Button
                            style={{ margin: "1em" }}
                            type="primary"
                            onClick={this.prev}
                            disabled={this.state.lyrics.length === 0 || this.state.currentLine === 0}
                        >
                            <Icon type="left" /> Previous Line
                        </Button>
                    </center>
                    {/* <Button type="primary" onClick={this.prev} disabled={this.state.lyrics.length === 0}>
                        <Icon type="right" />
                    </Button> */}
                </Card>

                <center style={{ margin_top: 30 }}>
                    <CSVLink
                        data={this.state.lyrics}
                        filename={`${this.state.songName}.csv`}
                        style={{ color: "white", margin: 'auto' }}>
                        <Button type="primary" shape="round" icon="download" size="large" >
                            Save File
                        </Button>
                    </CSVLink>
                </center>
            </div >
        );
    }
}