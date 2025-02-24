// Copyright (C) 2025  Matthias Paulmier

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

const options = {
    showCurrentTime: null,
    showRate: null,
    showRemainingTime: null,
}

let video,
    showCurrentTime,
    showRate,
    globalInterval

const hideSpbContainerMaybe = (rate) => {
    const spbElem = document.getElementById('sponsorBlockDurationAfterSkips')
    if (rate != 1 && !!spbElem && !!spbElem.textContent) {
        duration = getSpbDuration(spbElem)
        spbElem.style.display = 'none'
    } else if (!!spbElem) {
        spbElem.style.display = 'inline'
    }
}

const getSpbDuration = () => {
    // factors for each element [ seconds, minutes, hours ]
    const timeMapping = [1, 60, 3600]

    const spbElem = document.getElementById('sponsorBlockDurationAfterSkips')
    if (!spbElem || !spbElem.textContent) return null
    const [_, timeStr] = spbElem.textContent.match(/\ \((.*)\)/)

    // split and reverse into [ seconds, minutes, hours ]
    const timeElems = timeStr.split(':').map(Number).reverse()
    return timeElems.reduce((acc, elem, idx) => acc + elem * timeMapping[idx], 0)
}

const createElement = (id) => {
    const elem = document.createElement('span')
    elem.id = id
    return elem
}

const containers = {
    rate: createElement('hurryup-rate-container'),
    duration: createElement('hurryup-duration-container'),
    currentTime: createElement('hurryup-current-time-container'),
    remainingTime: createElement('hurryup-remaining-time-container'),
}

const clearAll = () => {
    hideSpbContainerMaybe(video.playbackRate)
    const oldContainer = document.getElementById('hurryup-text-container')
    if (!!oldContainer) oldContainer.remove()
}

const convertToHumanReadableTime = (time) => {
    let rest = time
    const hours = Math.floor(time / 3600)
    rest = rest % 3600
    let minutes = Math.floor(rest / 60)
    const seconds = Math.floor(rest % 60)

    let nums = []
    if (!!hours) {
        nums.push(hours)
        minutes = minutes.toFixed().padStart(2, 0)
    }
    nums.push(minutes)
    nums.push(seconds.toFixed().padStart(2, 0))
    return nums.join(':')
}

const onRateChange = () => {
    const rate = video.playbackRate.toFixed(2)
    const duration = getSpbDuration() || video.duration
    clearAll()

    if (rate == 1) {
        clearGlobalInterval()
        return
    } else if (!globalInterval && !video.paused) {
        startTicking()
    }

    hideSpbContainerMaybe(rate)
    containers.rate.textContent = rate

    const newDuration = duration / rate
    const newDurationText = convertToHumanReadableTime(newDuration)

    containers.duration.textContent = newDurationText
    updateCurrentTime()
    show()
}

const show = () => {
    const ytTimeElement = document.getElementsByClassName('ytp-time-wrapper')[0]
    const newElement = document.createElement('span')
    newElement.id = 'hurryup-text-container'
    newElement.append(' (')
    if (options.showRate) {
        newElement.append('x')
        newElement.appendChild(containers.rate)
        newElement.append(' → ')
    }
    if (options.showCurrentTime) {
        newElement.appendChild(containers.currentTime)
        newElement.append(' / ')
    }
    if (options.showRemainingTime) {
        newElement.appendChild(containers.remainingTime)
    } else {
        newElement.appendChild(containers.duration)
    }
    newElement.append(')')
    ytTimeElement.appendChild(newElement)
}

const updateCurrentTime = (rate, actualCurrentTime) => {
    containers.rate.textContent = rate
    const actualCurrentTimeText = convertToHumanReadableTime(actualCurrentTime)

    containers.currentTime.textContent = actualCurrentTimeText
}

const updateRemainingTime = (rate, actualCurrentTime, actualDuration) => {
    console.debug({
        actualCurrentTime,
        actualDuration,
    })
    const remainingTime = actualDuration - actualCurrentTime
    const remainingTimeText = convertToHumanReadableTime(remainingTime)

    containers.remainingTime.textContent = remainingTimeText
}

const onTick = () => {
    const rate = video.playbackRate.toFixed(2)
    const currentTime = Math.trunc(video.currentTime)
    const actualCurrentTime = Math.trunc(currentTime / rate)
    const duration = getSpbDuration() || Math.trunc(video.duration)
    const actualDuration = Math.trunc(duration / rate)

    updateCurrentTime(rate, actualCurrentTime)
    updateRemainingTime(rate, actualCurrentTime, actualDuration)
}

const loadOptions = () => {
    const optionKeys = Object.keys(options)
    return browser.storage.local.get(optionKeys, (result) => {
        optionKeys.forEach((key) => {
            options[key] = !!result[key]
        })
        clearAll()
        if (video.playbackRate != 1) show()
    })
}

const startTicking = () => {
    if (!globalInterval && video.playbackRate !== 1)
        globalInterval = setInterval(onTick, 500)
}

const clearGlobalInterval = () => {
    clearInterval(globalInterval)
    globalInterval = null
}

const init = () => {
    video = document.querySelector('video')
    if (!video) return
    clearAll()
    loadOptions()
    onRateChange()

    video.addEventListener('ratechange', onRateChange)
    video.addEventListener('play', startTicking)
    video.addEventListener('playing', startTicking)
    video.addEventListener('pause', clearGlobalInterval)
}

browser.runtime.onMessage.addListener((obj, _sender, _response) => {
    const { type } = obj

    if (type === 'videoPageLoaded') {
        setTimeout(init, 2000) // Wait for YouTube to load
    } else if (type === 'optionsUpdated') {
        loadOptions()
    }
})
