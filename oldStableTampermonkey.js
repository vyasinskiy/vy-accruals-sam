// ==UserScript==
// @name         Parsing accruals
// @namespace    http://tampermonkey.net/
// @version      2025-02-23
// @description  try to take over the world!
// @author       You
// @match        https://xn--j1ab.xn--80aaaf3bi1ahsd.xn--80asehdb/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=xn--80aaaf3bi1ahsd.xn--80asehdb
// @grant        none
// ==/UserScript==

(function () {
    'use strict';
    console.log('tampermonkey started');

    // const script = document.createElement('script');
    // script.src = 'https://vy-accruals.s3-ap-southeast-1.amazonaws.com/tampermonkey.js';
    // document.body.appendChild(script);
    // console.log('script injected');

    // Your code here...
})();

(function () {
    class KvartplataOnline {
        lastStep = window.sessionStorage.getItem('last_step');
        parsingId = window.sessionStorage.getItem('parsing_id');
        steps = {
            noLogin: 'noLogin',
            login: 'login',
            updateApartments: 'updateApartments',
            updateAccounts: 'updateAccounts',
            updateAccruals: 'updateAccruals',
        };

        async start() {
            await this.updateMissingInvoices();
            return;
            // return;
            console.log('start');
            console.log('lastStep', this.lastStep);
            if (!this.parsingId) {
                await this.createParsing();
            }

            switch (this.lastStep) {
                default:
                    this.updateApartmentsStep();
                    break;
                case this.steps.updateApartments:
                    this.updateAccountsStep();
                    break;
            }
        }

        async setLastStep(step) {
            if (!step) {
                const message = 'Wrong session step name: ' + step;
                console.error(message);
                alert(message);
            }

            console.log('starting: ', step);

            // log last step results and go to the next step
            if (this.lastStep && this.lastStep !== this.steps.noLogin) {
                await this.updateParsing(true);
            }

            window.sessionStorage.setItem('last_step', step);
            this.lastStep = step;
        }

        async updateApartmentsStep() {
            const getApartmentsUrl = this.makeUrl('personal/apartment');
            const apartments = await this.sendRequest(getApartmentsUrl);
            const url = this.makeAWSUrl('update-apartments');
            const options = {
                method: 'POST',
                body: JSON.stringify(apartments),
            };
            await this.sendRequest(url, options);
            const apartmentIdsToParse = apartments.map((item) => item.id);
            sessionStorage.setItem('apartmentIdsToParse', apartmentIdsToParse);
            await this.updateAccountsStep(apartmentIdsToParse);
            await this.setLastStep(this.steps.updateApartments);
        }

        async updateAccountsStep(apartmentIds) {
            let idsToParse = apartmentIds;
            if (!idsToParse) {
                const sessionIdsAsString = sessionStorage.getItem('apartmentIdsToParse');
                if (!sessionIdsAsString) {
                    await this.handleError(
                        `No ids to parse. ApartmentIds: ${apartmentIds}. sessionIdsAsString: ${sessionIdsAsString}`,
                    );
                }
                const sessionIds = sessionIdsAsString.split(',');
                idsToParse = sessionIds;
            }
            const promises = idsToParse.map(async (id) => {
                const accounts = await this.getAccountsByApartment(id);
                return {
                    apartmentId: id,
                    accounts: accounts,
                };
            });
            const results = await Promise.allSettled(promises);
            const resultsToUpdateInAws = results
                .filter((i) => i.status === 'fulfilled')
                .map((i) => i.value)
                .flatMap((item) =>
                    item.accounts.map((account) => ({
                        id: account.id,
                        organizationName: account.organizationName,
                        organizationId: account.organizationId,
                        address: account.address,
                        type: account.type,
                        debt: account.debt,
                        apartmentId: item.apartmentId,
                    })),
                );
            const updateUrl = this.makeAWSUrl('update-accounts');
            const options = {
                method: 'POST',
                body: JSON.stringify(resultsToUpdateInAws),
            };
            await this.sendRequest(updateUrl, options);
            const allSuccess = results.every((result) => result.status === 'fulfilled');
            if (allSuccess) {
                await this.setLastStep(this.steps.updateAccounts);
                const accountIdsToParse = resultsToUpdateInAws.map((result) => result.id);
                sessionStorage.setItem('accountIdsToParse', accountIdsToParse);
                await this.updateAccrualsStep(accountIdsToParse);
            }
        }

        async getAccountsByApartment(apartmentId) {
            const accountsUrl = this.makeUrl(`personal/Account/ListByApartment?apartmentId=${apartmentId}`);
            return await this.sendRequest(accountsUrl);
        }

        async updateAccrualsStep(accountIds) {
            let idsToParse = accountIds;
            if (!idsToParse) {
                const sessionIdsAsString = sessionStorage.getItem('accountIdsToParse');
                if (!sessionIdsAsString) {
                    await this.handleError(
                        `No ids to parse. AccountIds: ${accountIds}. sessionIdsAsString: ${sessionIdsAsString}`,
                    );
                }
                const sessionIds = sessionIdsAsString.split(',');
                idsToParse = sessionIds;
            }
            const promises = idsToParse.map(async (id) => {
                const accruals = await this.getAccrualsByAccount(id);
                return {
                    accountId: id, // TODO: in accruals accountId returns in structure of accrual, don't need mapping (remove)
                    accruals: accruals,
                };
            });
            const results = await Promise.allSettled(promises);
            const resultsToUpdateInAws = results
                .filter((i) => i.status === 'fulfilled')
                .map((i) => i.value)
                .flatMap((item) =>
                    item.accruals.map((accrual) => ({
                        accountId: accrual.accountId,
                        periodName: accrual.periodName,
                        periodId: accrual.periodId,
                        inBalance: accrual.inBalance,
                        sum: accrual.sum,
                        fine: accrual.fine,
                        toPay: accrual.toPay,
                        payed: accrual.payed,
                        invoiceExists: accrual.invoiceExists,
                    })),
                );
            const updateUrl = this.makeAWSUrl('update-accruals');
            const options = {
                method: 'POST',
                body: JSON.stringify(resultsToUpdateInAws),
            };
            await this.sendRequest(updateUrl, options);
            const allSuccess = results.every((result) => result.status === 'fulfilled');
            if (allSuccess) {
                await this.setLastStep(this.steps.updateAccruals);
                // check new accruals and send (bot)
            }
        }

        async getAccrualsByAccount(accountId) {
            const accrualsUrl = this.makeUrl(`personal/Accruals/List?accountId=${accountId}`);
            return await this.sendRequest(accrualsUrl);
        }

        async uploadInvoiceToS3() {}

        async updateMissingInvoices() {
            const awsUrl = this.makeAWSUrl('get-missing-invoices');
            const data = await this.sendRequest(awsUrl);
            if (data.length === 0) return;
            const sliced = data.result.slice(0, 5);
            const promises = sliced.map((accrual) => this.getInvoiceFormDataForAccrual(accrual));
            const results = await Promise.allSettled(promises);
            const resultsToUploadToS3 = results.filter((i) => i.status === 'fulfilled').map((i) => i.value);
            const formData = new FormData();
            resultsToUploadToS3.forEach(([name, blob, fileName]) => {
                formData.append(name, blob, fileName);
            });
            formData.append('config', JSON.stringify(sliced));
            const uploadUrl = this.makeAWSUrl('upload-invoices-to-s3');
            const options = {
                method: 'POST',
                body: formData,
            };
            const result = await fetch(uploadUrl, options);
            setTimeout(function () {
                window.location.reload();
            }, 10000);
            // const allSuccess = results.every(result => result.status === 'fulfilled');
        }

        async getInvoiceFormDataForAccrual(accrual) {
            const { account_external_id, period_id, id } = accrual;
            const blob = await this.getInvoiceToAccountForPeriod(account_external_id, period_id);
            const name = 'pdfFile';
            const fileName = `${id}.pdf`;
            return [name, blob, fileName];
        }

        async getInvoiceToAccountForPeriod(accountExternalId, periodId) {
            const url = this.makeUrl(`personal/Accruals/GetInvoice/${accountExternalId}?period=${periodId}`);
            return await this.sendPdfRequest(url);
        }

        async sendRequest(url, options, stopProcessing) {
            if (options?.method === 'POST') {
                options.headers = { 'Content-Type': 'application/json' };
            }
            console.info(`Fetching url: ${url}`);
            const response = await fetch(url, options);
            const data = await response.json();
            const logData = JSON.stringify(data);
            if (!response.ok) {
                await this.handleError(`Fetch error to url: ${url}$. Data: ${logData}`);
            }
            const isLambdaResponse = data && 'isSuccess' in data;
            if (isLambdaResponse && !data.isSuccess && !stopProcessing) {
                await this.handleError(`Backend error to url ${url}: ${logData}`);
            } else if (data.isSuccess) {
                console.log(`%cSuccessfully fetched url: ${url}, data: ${logData}`, 'color: green');
            }
            return isLambdaResponse ? data.data : data;
        }

        async sendPdfRequest(url) {
            const response = await fetch(url);
            if (!response.ok) {
                await this.handleError(`Fetch error to url: ${url}$. Response: ${response}`);
            }
            return await response.blob();
        }

        async handleError(error) {
            console.error(error);
            await this.updateParsing(false, error);
        }

        makeUrl(pathname) {
            return 'https://xn--j1ab.xn--80aaaf3bi1ahsd.xn--80asehdb/' + pathname;
        }

        makeAWSUrl(pathname) {
            return 'https://77iqvk23va.execute-api.ap-southeast-1.amazonaws.com/default/' + pathname;
        }

        async updateParsing(isSuccess, message) {
            if (!this.parsingId) {
                throw new Error('No parsingId provided while setting up last step ' + this.lastStep);
            }
            const url = this.makeAWSUrl('update_parsing_result_by_id');
            const options = {
                method: 'POST',
                body: JSON.stringify({
                    parsingId: this.parsingId,
                    step: this.lastStep,
                    isSuccess,
                    message,
                }),
            };
            await this.sendRequest(url, options, !isSuccess);
        }

        async createParsing() {
            const url = this.makeAWSUrl('create_parsing');
            const options = {
                method: 'POST',
            };
            const data = await this.sendRequest(url, options);
            sessionStorage.setItem('parsing_id', data.id);
            this.parsingId = data.id;
        }
    }

    const parser = new KvartplataOnline();
    parser.start();
})();
