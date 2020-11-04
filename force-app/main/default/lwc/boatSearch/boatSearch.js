import { LightningElement, track, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
// imports
export default class BoatSearch extends NavigationMixin(LightningElement) {
    @track isLoading = true;

    handleLoading() {
        this.isLoading = true;
    }
    handleDoneLoading() {
        this.isLoading = false;
    }
    createNewBoat() {
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Boat__c',
                actionName: 'new'
            }
        });
    } type
    searchBoats(event) {
        this.boatTypeId = event.detail.boatTypeId;
        this.template.querySelector('c-boat-search-results').searchBoats(this.boatTypeId);
    }
}