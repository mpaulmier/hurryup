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

const pad = (num) => num
      .toFixed()
      .padStart(2, 0)

const clear = () => {
    const oldUpdatedTime = document.getElementById("hurryup-updated-time")
    if (!!oldUpdatedTime) oldUpdatedTime.remove()
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
        minutes = pad(minutes)
    }
    nums.push(minutes)
    nums.push(pad(seconds))
    return nums.join(":")
}

const getSponsorBlockDuration = (element) => {
    // factors for each element [ seconds, minutes, hours ]
    const timeMapping = [ 1, 60, 3600 ]
    const [_, timeStr] = element
          .textContent
          .match(/\ \((.*)\)/)
    // split into [ seconds, minutes, hours ]
    const timeElems = timeStr.split(":").map(Number).reverse()
    return timeElems.reduce((acc, elem, idx) => acc + elem * timeMapping[idx], 0)
}

const updateTime = (video, rate) => {
    clear()

    const element = document.getElementsByClassName("ytp-time-wrapper")[0]

    let duration = video.duration
    const spbElem = document.getElementById("sponsorBlockDurationAfterSkips")
    if (rate != 1 && !!spbElem && !!spbElem.textContent) {
        duration = getSponsorBlockDuration(spbElem)
        spbElem.style.display = "none"
    } else if (!!spbElem) {
        spbElem.style.display = "inline"
    }

    if (rate == 1) return

    const newDuration = duration / rate
    const newDurationText = convertToHumanReadableTime(newDuration)

    const newElement = document.createElement("span")
    newElement.id = "hurryup-updated-time"
    newElement.textContent = ` (x${rate} => ${newDurationText})`
    element.appendChild(newElement)
}

const updateSpeed = () => {
    const video = document.querySelector("video")
    if (!video) return
    const initialRate = video.playbackRate
    updateTime(video, initialRate)

    video.addEventListener("ratechange", () => {
        const newRate = video.playbackRate.toFixed(2)
        updateTime(video, newRate)
    })
}

browser.runtime.onMessage.addListener((obj, _sender, _response) => {
    const { type } = obj
    clear()

    if (type === "NEW") {
        setTimeout(updateSpeed, 2000) // Wait for YouTube to load
    }
})

