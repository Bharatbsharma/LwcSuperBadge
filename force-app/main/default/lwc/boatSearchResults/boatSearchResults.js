import { LightningElement, wire, api, track } from 'lwc';
import getBoats from '@salesforce/apex/BoatDataService.getBoats';
import updateBoatList from '@salesforce/apex/BoatDataService.updateBoatList';
import { updateRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import { publish, MessageContext } from 'lightning/messageService';
import BOATMC from '@salesforce/messageChannel/BoatMessageChannel__c';

const LOADING_EVENT = 'loading';
const DONE_LOADING_EVENT = 'doneloading';
const SUCCESS_TITLE = 'Success';
const MESSAGE_SHIP_IT = 'Ship it!';
const SUCCESS_VARIANT = 'success';
const ERROR_TITLE = 'Error';
const ERROR_VARIANT = 'error';


export default class BoatSearchResults extends LightningElement {

    boatTypeId = '';
    @track boats;
    @track draftValues = [];
    selectedBoatId = '';
    isLoading = false;
    error = undefined;
    wiredBoatsResult;

    @wire(MessageContext) messageContext;

    columns = [
        { label: 'Name', fieldName: 'Name', type: 'text', editable: 'true' },
        { label: 'Length', fieldName: 'Length__c', type: 'text', editable: 'true' },
        { label: 'Price', fieldName: 'Price__c', type: 'text', editable: 'true' },
        { label: 'Description', fieldName: 'Description__c', type: 'text', editable: 'true' },
    ];

    @api
    searchBoats(boatTypeId) {
        this.isLoading = true;
        this.notifyLoading(this.isLoading);
        this.boatTypeId = boatTypeId;
    }

    @wire(getBoats, { boatTypeId: '$boatTypeId' })
    wiredBoats(result) {
        this.boats = result;
        if (result.error) {
            this.error = result.error;
            this.boats = undefined;
        } else if (result.data) {
            //this.boats = result.data;
        }
        this.isLoading = false;
        this.notifyLoading(this.isLoading);
    }

    updateSelectedTile(event) {
        this.selectedBoatId = event.detail.boatId;
        this.sendMessageService(this.selectedBoatId);
    }

    handleSave(event) {
        this.notifyLoading(true);
        const recordInputs = event.detail.draftValues.slice().map(draft => {
            const fields = Object.assign({}, draft);
            return { fields };
        });

        console.log(recordInputs);
        const promises = recordInputs.map(recordInput => updateRecord(recordInput));
        Promise.all(promises).then(res => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: SUCCESS_TITLE,
                    message: MESSAGE_SHIP_IT,
                    variant: SUCCESS_VARIANT
                })
            );
            this.draftValues = [];
            return this.refresh();
        }).catch(error => {
            this.error = error;
            this.dispatchEvent(
                new ShowToastEvent({
                    title: ERROR_TITLE,
                    message: error.message.body,
                    variant: ERROR_VARIANT
                })
            );
            this.notifyLoading(false);
        }).finally(() => {
            this.draftValues = [];
        });
    }
    @api
    async refresh() {
        this.isLoading = true;
        this.notifyLoading(this.isLoading);
        await refreshApex(this.boats);
        this.isLoading = false;
        this.notifyLoading(this.isLoading);
    }
    notifyLoading(isLoading) {
        var spinnerEvent;
        if (isLoading) {
            spinnerEvent = new CustomEvent(LOADING_EVENT);
        } else {
            spinnerEvent = new CustomEvent(DONE_LOADING_EVENT);
        }
        this.dispatchEvent(spinnerEvent);
    }
    // Publishes the selected boat Id on the BoatMC.
    sendMessageService(boatId) {
        const recordPayload = {
            recordId: boatId
        };
        publish(this.messageContext, BOATMC, recordPayload);
    }
}