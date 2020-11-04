import { LightningElement, api, track } from 'lwc';
import { createRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import NAME_FIELD from '@salesforce/schema/BoatReview__c.Name';
import COMMENT_FIELD from '@salesforce/schema/BoatReview__c.Comment__c';
import RATING_FIELD from '@salesforce/schema/BoatReview__c.Rating__c';
import BOAT_REVIEW_OBJECT from '@salesforce/schema/BoatReview__c';
import BOAT_FIELD from '@salesforce/schema/BoatReview__c.Boat__c';
const SUCCESS_TITLE = 'Review Created!';
const SUCCESS_VARIANT = 'success';

export default class BoatAddReviewForm extends LightningElement {
    @api boat;
    boatId;
    nameField = NAME_FIELD;
    commentField = COMMENT_FIELD;
    boatReviewObject = BOAT_REVIEW_OBJECT;
    rating = 0;
    review = '';
    title = '';
    comment = '';


    handleTitleChange(event) {
        this.title = event.target.value;
    }

    handleCommentChange(event) {
        this.comment = event.target.value;
    }

    handleRatingChange(event) {
        this.rating = event.detail;
    }

    handleRatingChanged(event) {
        console.log('--new rating : ' + JSON.stringify(event.detail));
        this.rating = event.detail.rating;
    }

    handleReset() {
        const inputFields = this.template.querySelectorAll(
            'lightning-input-field'
        );
        if (inputFields) {
            inputFields.forEach(field => {
                field.reset();
            });
        }
    }
    /*handleOnSubmit() {
        const fields = {};
        fields[ NAME_FIELD.fieldApiName ] = this.title;
        fields[ COMMENT_FIELD.fieldApiName ] = this.comment;
        fields[ BOAT_FIELD.fieldApiName ] = this.boat.id;
        fields[ RATING_FIELD.fieldApiName ] = this.rating;
        const recordInput = { apiName: BOATREVIEW_OBJECT.objectApiName, fields };
        createRecord( recordInput )
            .then( () => {
                this.dispatchEvent(
                    new ShowToastEvent( {
                        title: 'Success',
                        message: 'Review created!',
                        variant: 'success',
                    } ),
                );
                this.dispatchEvent(
                    new CustomEvent( 'reviewadded' )
                );
            } )
            .catch( error => {
                this.dispatchEvent(
                    new ShowToasEvent( {
                        title: 'Error creating record',
                        message: error.body.message,
                        variant: 'error',
                    } ),
                );
            } );
    }*/
    handleSubmit(event) {
        event.preventDefault();
        const fields = event.detail.fields;
        fields.Boat__c = this.boatId;
        fields.Rating__c = this.rating;
        this.template.querySelector('lightning-record-edit-form').submit(fields);
    }
    @api
    get recordId() {
        return this.boatId;
    }

    set recordId(value) {
        this.boatId = value;
    }

    // Shows a toast message once form is submitted successfully
    // Dispatches event when a review is created
    handleSuccess() {
        const evt = new ShowToastEvent({
            title: SUCCESS_TITLE,
            message: '',
            variant: SUCCESS_VARIANT,
        });
        this.dispatchEvent(evt);
        const createreviewEvent = new CustomEvent('createreview');
        this.dispatchEvent(createreviewEvent);
        this.handleReset();
    }
}