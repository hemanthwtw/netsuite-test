/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
//v1
define(['N/ui/serverWidget'], (serverWidget) => {

    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} context
     * @param {ServerRequest} context.request - Encapsulation of the incoming request
     * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
     */
    const onRequest = (context) => {
        // Suitelets handle GET (loading the page) and POST (submitting a form) requests
        if (context.request.method === 'GET') {
            
            // 1. Create the UI Form
            const form = serverWidget.createForm({
                title: 'My First Simple Suitelet'
            });

            // 2. Add a basic field to the form
            const sampleField = form.addField({
                id: 'custpage_sample_text_field',
                type: serverWidget.FieldType.TEXT,
                label: 'Hello Message'
            });

            // 3. Set a default value for the field
            sampleField.defaultValue = 'Welcome to your custom NetSuite page!';

            // 4. Display the form in the user's browser
            context.response.writePage(form);

        } else {
            // This section runs if a user clicked a "Submit" button on the form
            context.response.write('You submitted the form!');
        }
    };

    return { onRequest };
});