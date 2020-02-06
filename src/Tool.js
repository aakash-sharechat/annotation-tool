import 'antd/dist/antd.css'
// import './Tool.css'
import React, { Component } from 'react'
import { Popconfirm, Typography, Card, Slider, InputNumber, Row, Col, Input, Button, Icon } from 'antd'

const { Title } = Typography;
const faded = { color: "rgba(0, 0, 0, 0.5)" }

export class Tool extends Component {
    constructor(props) {
        super(props)

        this.state = {
            source: props.source,
            lyrics: ,
            wordLevel: props.wordLevel,
            duration: 0,
            rate: 1,
            currentLine: 0,
            songName: "",
            lineActive: false,
            completed: false,
        }

        this.makeSRT = this.makeSRT.bind(this)
        this.downloadSRT = this.downloadSRT.bind(this)
        this.mark = this.mark.bind(this)
        this.prev = this.prev.bind(this)
        this.validIndex = this.validIndex.bind(this)
        this.annotateElement = this.annotateElement.bind(this)
        this.reset = this.reset.bind(this)
        this.silent = this.silent.bind(this)
        this.changeRate = this.changeRate.bind(this)
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
            completed = this.state.currentLine === this.state.lyrics.length
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
            completed = this.state.currentLine === this.state.lyrics.length
        }
        this.setState({ lyrics: lyrics, completed: completed, lineActive: false })
    }

    reset() {
        let lyrics = this.state.lyrics
        for (let i = 0; i < lyrics.length; i++) {
            lyrics[i].startTime = 0
            lyrics[i].endTime = 0
        }
        this.audio.pause()
        this.audio.currentTime = 0
        this.setState({ lyrics: lyrics, currentLine: 0, completed: false, lineActive: false })
    }

    changeRate(rate) {
        this.setState({ rate: rate })
        this.audio.playbackRate = rate
    }

    formatTime(milli) {
        const minutes = Math.floor(milli / (60 * 1000))
        milli -= minutes * (60 * 1000)
        const seconds = Math.floor(milli / 1000)
        milli -= seconds * 1000

        return `00:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')},${String(milli).padStart(3, '0')}`
    }

    makeSRT() {
        let srtString = ''
        for (let i = 0; i < this.state.lyrics.length; i++) {
            srtString += `${i + 1}\n`
            srtString += `${this.formatTime(this.state.lyrics[i].startTime)}-->`
            srtString += `${this.formatTime(this.state.lyrics[i].endTime)}\n`
            srtString += this.state.lyrics[i].line + '\n\n'
        }
        return srtString
    }

    downloadSRT() {
        const srtString = this.makeSRT()
        const file = new Blob([srtString])
        const element = document.createElement("a");
        element.href = URL.createObjectURL(file);
        document.body.appendChild(element); // Required for this to work in FireFox
        element.download = `${this.state.songName}.srt`
        element.click();
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
        const fadeText = ind !== this.state.currentLine
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
        if (this.state.lyrics.length === 0) {
            return <Title>Please add lyrics</Title>
        }
        if (this.state.completed)
            return <Title>Lyrics Completed!</Title>
        return (
            <div>
                {this.validIndex(this.state.currentLine - 1, true)}
                {
                    this.state.currentLine < this.state.lyrics.length && this.state.currentLine > 0 &&
                    <Button type="dashed" onClick={this.silent} disabled={this.state.lyrics.length === 0}>Silence</Button>
                }
                {this.validIndex(this.state.currentLine)}
                <Button type="dashed" onClick={this.silent} disabled={this.state.lyrics.length === 0}>Silence</Button>
                {this.validIndex(this.state.currentLine + 1, true)}
            </div>
        )
    }

    render() {
        return (
            <div>
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
                        <Popconfirm
                            placement="bottom"
                            title="Are you sure you want to reset? You will lose all annotation"
                            onConfirm={this.reset} okText="Yes" cancelText="No">
                            <Button style={{ margin: "1em" }} type="danger" disabled={this.state.lyrics.length === 0}>Reset</Button>
                        </Popconfirm>
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
                    <Button type="primary" shape="round" icon="download" size="large" onClick={this.downloadSRT} >
                        Save File
                        </Button>
                </center>
            </div >
        );
    }
}