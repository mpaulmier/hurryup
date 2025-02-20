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
    showCurrentTimeCheckbox.addEventListener('change', saveOptions)
    showRemainingTimeCheckbox.addEventListener('change', saveOptions)
    showRateCheckbox.addEventListener('change', saveOptions)
})
