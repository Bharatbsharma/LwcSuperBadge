import { LightningElement, api, wire, track } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';

// import BOATMC from the message channel
import { APPLICATION_SCOPE, MessageContext, subscribe, unsubscribe } from 'lightning/messageService';
import BOATMC from '@salesforce/messageChannel/BoatMessageChannel__c';

// Declare the const LONGITUDE_FIELD for the boat's Longitude__s
// Declare the const LATITUDE_FIELD for the boat's Latitude
// Declare the const BOAT_FIELDS as a list of [LONGITUDE_FIELD, LATITUDE_FIELD];

const LONGITUDE_FIELD = 'Boat__c.Geolocation__Longitude__s';
const LATITUDE_FIELD = 'Boat__c.Geolocation__Latitude__s';
const BOAT_FIELDS = [LONGITUDE_FIELD, LATITUDE_FIELD];

export default class BoatMap extends LightningElement {
    subscription = null;
    @api boatId;

    @api get recordId() {
        return this.boatId;
    }

    set recordId(value) {
        this.setAttribute('boatId', value);
        this.boatId = value;
    }

    error = undefined;
    @track mapMarkers = [];

    @wire(getRecord, { recordId: '$boatId', fields: BOAT_FIELDS })
    wireRecord({ error, data }) {
        if (data) {
            this.error = undefined;
            const longitude = data.fields.Geolocation__Longitude__s.value;
            const latitude = data.fields.Geolocation__Latitude__s.value;
            this.updateMap(longitude, latitude);
        } else if (error) {
            this.error = error;
            this.boatId = undefined;
            this.mapMarkers = [];
        }
    }
    @wire(MessageContext)
    messageContext;

    // Runs when component is connected, subscribes to BoatMC
    connectedCallback() {
        // recordId is populated on Record Pages, and this component
        // should not update when this component is on a record page.
        if (this.subscription || this.recordId) {
            return;
        }
        // Subscribe to the message channel to retrieve the recordID and assign it to boatId.
        this.subscribeMC();
    }

    subscribeMC() {
        let subscription = subscribe(this.messageContext, BOATMC, (message) => { this.boatId = message.recordId }, { scope: APPLICATION_SCOPE });
    }

    handleMessage(message) {
        this.boatId = message.recordId;
    }

    // Creates the map markers array with the current boat's location for the map.
    updateMap(Longitude, Latitude) {
        this.mapMarkers = [Longitude, Latitude];
    }

    // Getter method for displaying the map component, or a helper method.
    get showMap() {
        return this.mapMarkers.length > 0;
    }
}