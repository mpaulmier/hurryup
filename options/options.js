document.addEventListener('DOMContentLoaded', () => {
    const showCurrentTimeCheckbox = document.getElementById('show-current-time-option')
    const showRemainingTimeCheckbox = document.getElementById('show-remaining-time-option')
    const showRateCheckbox = document.getElementById('show-rate-option')

    browser.storage.local.get(['showCurrentTime', 'showRemainingTime', 'showRate'], (result) => {
        showCurrentTimeCheckbox.checked = !!result.showCurrentTime
        showRemainingTimeCheckbox.checked = !!result.showRemainingTime
        showRateCheckbox.checked = !!result.showRate
    })

    const saveOptions = () => {
        const showCurrentTime = showCurrentTimeCheckbox.checked
        const showRemainingTime = showRemainingTimeCheckbox.checked
        const showRate = showRateCheckbox.checked

        browser.storage.local.set({ showCurrentTime, showRate, showRemainingTime }, () => {
            browser.tabs.query({}, (tabs) => {
                tabs.forEach((tab) => {
                    if (tab.url?.includes('youtube.com/watch'))
                        browser.tabs.sendMessage(tab.id, {
                            type: 'optionsUpdated',
                        })
                })
            })
        })
    }

    const updatePreview = () => {
        const oldContainer = document.getElementById('demo-container')
        if (!!oldContainer) oldContainer.remove()
        const timeContainer = document.getElementById('time-container')
        const newElement = document.createElement('span')
        newElement.id = 'demo-container'
        newElement.append(' (')
        if (showRateCheckbox.checked) {
            newElement.append('x')
            newElement.append('1.5')
            newElement.append(' → ')
        }
        if (showCurrentTimeCheckbox.checked) {
            newElement.append('32:53')
            newElement.append(' / ')
        }
        if (showRemainingTimeCheckbox.checked) {
            newElement.append("45:39")
        } else {
            newElement.append('1:18:32')
        }
        newElement.append(')')
        timeContainer.appendChild(newElement)
    }

    const saveAndUpdate = () => {
        saveOptions()
        updatePreview()
    }

    updatePreview()

    showCurrentTimeCheckbox.addEventListener('change', saveAndUpdate)
    showRemainingTimeCheckbox.addEventListener('change', saveAndUpdate)
    showRateCheckbox.addEventListener('change', saveAndUpdate)
})
