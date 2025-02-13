document.addEventListener('DOMContentLoaded', () => {
    const showCurrentTimeCheckbox = document.getElementById('show-current-time-option')
    const showRateCheckbox = document.getElementById('show-rate-option')

    browser.storage.local.get(['showCurrentTime', 'showRate'], (result) => {
        showCurrentTimeCheckbox.checked = !!result.showCurrentTime
        showRateCheckbox.checked = !!result.showRate
    })

    const saveOptions = () => {
        const showCurrentTime = showCurrentTimeCheckbox.checked
        const showRate = showRateCheckbox.checked

        browser.storage.local.set({ showCurrentTime, showRate }, () => {
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
    showRateCheckbox.addEventListener('change', saveOptions)
})
