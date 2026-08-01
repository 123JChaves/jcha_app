// jcha_app/e2e/config.ts
module.exports = {
    iniciarClient: async () => ({
        $: () => Promise.resolve({
            waitForDisplayed: async () => true,
            click: async () => true,
            setValue: async () => true,
            isDisplayed: async () => true,
        }),
        isKeyboardShown: async () => false,
        hideKeyboard: async () => true,
        deleteSession: async () => true,
    })
};