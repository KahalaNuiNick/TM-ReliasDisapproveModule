// ==UserScript==
// @name         Disapprove Course for Enrollment
// @namespace    http://tampermonkey.net/
// @version      1.8
// @description  Manual first run, automatic finish after reload (loop fix + retry). CTRL+SHIFT+E to fire on Course
// @author       Nick M (https://connect.relias.com/s/profile/005RM00000AQ7Cz) @ Relias Connect Groups
// @homepageURL  https://github.com/KahalaNuiNick/TM-ReliasDisapproveModule
// @match        *://*.reliaslearning.com/Learning/Course.aspx*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=reliaslearning.com
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    const selectors = [
        '#FormContentPlaceHolder_MainContentPlaceHolder_RightColumnPlaceHolder_RightColumnPlaceHolder_DisplayInLearningCatalogCheckBox',
        '#FormContentPlaceHolder_MainContentPlaceHolder_RightColumnPlaceHolder_RightColumnPlaceHolder_ApprovedForEnrollmentNo',
        '#FormContentPlaceHolder_MainContentPlaceHolder_RightColumnPlaceHolder_RightColumnPlaceHolder_Save'
    ];

    const selectorAfterReload = '#FormContentPlaceHolder_MainContentPlaceHolder_PreviousPageLink';
    const reloadDelay = 2000; // Wait before starting search for link
    const maxWaitAfterReload = 10000; // Max wait for link after reload

    function waitForElement(selector, timeout = 10000) {
        return new Promise((resolve) => {
            const el = document.querySelector(selector);
            if (el) return resolve(el);

            const observer = new MutationObserver(() => {
                const found = document.querySelector(selector);
                if (found) {
                    observer.disconnect();
                    resolve(found);
                }
            });

            observer.observe(document.body, { childList: true, subtree: true });

            setTimeout(() => {
                observer.disconnect();
                resolve(null);
            }, timeout);
        });
    }

    async function clickElements(list, timeoutOverride) {
        for (let i = 0; i < list.length; i++) {
            const element = await waitForElement(list[i], timeoutOverride || 8000);
            if (element) {
                console.log(`Clicking: ${list[i]}`);
                element.click();
                await new Promise(r => setTimeout(r, 500));
            } else {
                console.warn(`Not found: ${list[i]}`);
            }
        }
    }

    async function runFirstThree() {
        console.log('Running first 3 clicks...');
        await clickElements(selectors);
        localStorage.setItem('afterSave', 'true');
    }

    async function runAfterReload() {
        console.log(`Waiting ${reloadDelay}ms before searching for post-save link...`);
        await new Promise(r => setTimeout(r, reloadDelay));
        // Clear flag BEFORE clicking to prevent loops
        localStorage.removeItem('afterSave');
        console.log(`Searching for link up to ${maxWaitAfterReload}ms...`);
        await clickElements([selectorAfterReload], maxWaitAfterReload);
    }

    // Auto-run after reload
    if (localStorage.getItem('afterSave') === 'true') {
        runAfterReload();
    }

    // Manual trigger via keyboard shortcut (Ctrl+Shift+E)
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.shiftKey && e.code === 'KeyE') {
            runFirstThree();
        }
    });

    console.log('Script loaded. Press Ctrl+Shift+E to start the first 3 clicks.');
})();
