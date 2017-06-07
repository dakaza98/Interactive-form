const form = document.getElementsByTagName("form")[0];
const title = document.getElementById("title");
const otherTitle = document.getElementById("other-title");
const design = document.getElementById("design");
const color = document.getElementById("color");
const colorDiv = color.parentElement;
const colorOptions = color.options;
const activities = document.querySelectorAll(".activities input");
const totalActivityCostElement = document.createElement("h3");
const payment = document.getElementById("payment");
const paymentDivs = payment.parentElement.querySelectorAll("fieldset > div");
const creditCardInputs = document.querySelectorAll(".col input");
const submitButton = form.lastElementChild;

//The total cost for all selected activities
let totalActivityCost = 0;

/*------------------Functions--------------------*/

//Hides and shows elements
function ChangeDisplayValue(element, value){
  element.style.display = value;
}

function ChangePaymentMethod(selectedIndex){
  for(let i = 0; i < paymentDivs.length; i++){
    //Since there are 4 different options in the select menu but only 3 payment methods, 1 has to be added to i so that only the options with a payment method can show
    //the corrosponding div.
    const displayValue = selectedIndex === i + 1 ? "block" : "none";
    ChangeDisplayValue(paymentDivs[i], displayValue);
  }
}

//Used to create an object that stores neccessary information about the activities checkboxes
function Checkbox(index){
  this.checkbox = activities[index];
  this.text = this.checkbox.nextSibling.textContent;      //The text that is after the checkbox;
  this.time = GetActivityTime(this.text);
}

//Creates a span element containing the error message and appends it to either the nearest label or legend element
function CreateErrorMessage(element, labelOrLegend, errorText, e){
  //e can be sent as null if the preventDefault method doesn't need to be fired
  if(e !== null)
    e.preventDefault();

  //Gets the element the error should be applied to
  let elementToAddErrorTo = SelectLabelOrLegend(element, labelOrLegend);

  //The styling differ for legend and label and thats why this condition is needed
  let styleLabel = labelOrLegend === "label" ? true : false;

  //Prevents creation of more than one error message
  if(elementToAddErrorTo.children.length === 1)
    RemoveErrorMessage(element, labelOrLegend);

  const errorMessage = document.createElement("span");

  let fontSize;
  let errorTextToDisplay = errorText;                   //The errorText needs to be changed depending on what element to stlye: label or legend

  if(styleLabel){
    fontSize = "1em";
    errorTextToDisplay = " " + errorText;               //Adds a space to the error text when styling a label
    elementToAddErrorTo.style.color = "red";            //Changes the entire elements color to red since the error is display on the same line as the label
  }

  else{
    fontSize = ".8em";
    errorTextToDisplay = "<br>" + errorText;            //Adds a linebreak to the error text when styling a legend
    errorMessage.style.color = "red";                   //Changes only the span elements color to red since the error is displayed on a new line
  }

  errorMessage.innerHTML = errorTextToDisplay;
  errorMessage.style.fontSize = fontSize;
  elementToAddErrorTo.appendChild(errorMessage);        //Appends the error message to the element that will contain the error message
}

//Creates or removes an error message depending on if the sent condition is true or not
//If the condtion is true, the data entered into the element was invalid
function CreateOrRemoveErrorMessage(condition, element, labelOrLegend, errorText, e){
  if(condition)
    CreateErrorMessage(element, labelOrLegend, errorText, e);

  else
    RemoveErrorMessage(element, labelOrLegend);
}

//Get the time for a specific activity
function GetActivityTime(element){
  return element.substring(element.indexOf("—"), element.indexOf(","));
}

//Returns the length of the entered number in the credit card number input
function GetCreditCardLength(){
  return creditCardInputs[0].value.length;
}

//Removes an error message if the elenents value is valid
function RemoveErrorMessage(element, labelOrLegend){
  const elementContainingError = SelectLabelOrLegend(element, labelOrLegend);
  if(elementContainingError.firstElementChild !== null){          //An error will only be removed if there is an error message to remove
    if(labelOrLegend === "label")                                 //Resets the labels color back to black
      elementContainingError.style.color = "black";

    elementContainingError.removeChild(elementContainingError.firstElementChild);
  }
}

//Based on the condition, one of the supplied two values will be returned
function ReturnOneOfTwoValues (condition, trueValue, falseValue){
  return condition ? trueValue : falseValue;
}

//Selects a label element or a legend element depending on the labelOrLegend variable
function SelectLabelOrLegend(element, labelOrLegend){
  //Returns the adjacent label element
  if(labelOrLegend === "label")
    return element.previousElementSibling;

  //Returns the closest legend element
  else
    return element.parentElement.parentElement.firstElementChild;
}


/*-------------------Events---------------------*/


//The event for when a job role is selected
title.addEventListener("change", (e) => {
  const selectedValue = e.target.value;
  const displayValue = selectedValue === "other" ? "inline-block" : "none";     //If the selected value is other a new text field is created below it

  ChangeDisplayValue(otherTitle, displayValue);
});

//The event for when a T-shirt design is selected
design.addEventListener("change", (e) => {
  const selectedValue = e.target.value;

  if(selectedValue !== "Select Theme"){
    ChangeDisplayValue(colorDiv, "block");      //Shows the div where the user selects color

    let changeSelectedValue = true;             //A boolean used to change the selected color to the first available color when the user switches design.

    for(let i = 0; i < colorOptions.length; i++){
      const condition = ReturnOneOfTwoValues(selectedValue === "js puns", i < 3, i > 2);    //Shows the 3 first options if the theme is js puns, otherwise the 3 last options are shown
      const displayValue = ReturnOneOfTwoValues(condition, "block", "none")

      if(displayValue === "block" && changeSelectedValue){
        color.selectedIndex = i;                              //Changes the selected value to the first option that can be clicked
        changeSelectedValue = false;
      }

      ChangeDisplayValue(colorOptions[i], displayValue);     //Shows the colors available to the current theme and hides the colors that are for the other theme
    }
  }

  else
    ChangeDisplayValue(colorDiv, "none");       //Hides the div where the user selectes the color if no theme is chosen
});

//An array storing a checkbox object for every activities checkbox
let checkboxArray = [];

//Fills the array with Checkbox objects
for (let i = 0; i < activities.length; i++)
  checkboxArray.push(new Checkbox(i));

//Adds an event listener for all the activity checkboxes
for(let i = 0; i < activities.length; i++){
  const chosenCheckbox = checkboxArray[i];
  chosenCheckbox.checkbox.addEventListener("change", (e) => {
    const checked = e.target.checked;

    if(chosenCheckbox.text.indexOf(",") !== -1){    //The time for every workshop ends with a comma but not every checkbox has a specified time
      for(let j = 0; j < activities.length; j++){   //Checkes every checkbox to see if the chosen time is identical to the checkbox currently being checked
        const currentCheckbox = new Checkbox(j);

        //Disables the checkboxes if the times are the same and prevents the checkbox from disabling itself.
        if(currentCheckbox.time === chosenCheckbox.time && currentCheckbox.checkbox !== chosenCheckbox.checkbox){
          const color = ReturnOneOfTwoValues(checked, "gray", "black");       //Switches color on the checkboxes that get disabled or enabled

          currentCheckbox.checkbox.disabled = checked;
          currentCheckbox.checkbox.parentElement.style.color = color;
        }
      }
    }

    //Checks if the text contains a price
    if(chosenCheckbox.text.indexOf("$") !== -1){
      const activityCost = chosenCheckbox.text.substring(chosenCheckbox.text.indexOf("$") + 1);   //Removes the $ to be able to count the total cost
      const operator = ReturnOneOfTwoValues(checked, "+", "-");                                   //Decides if the value should be added or subtracted

      totalActivityCost += parseInt(operator + activityCost);
      totalActivityCostElement.innerHTML = "Total: $" + totalActivityCost;                        //Displays the total cost
    }
  });
}

//Switches the payment method
payment.addEventListener("change", (e) => {
  const selectedIndex = e.target.selectedIndex;
  //If there is a error message saying that no payment method has been chosed it gets removed when a new payment method is selected
  if(selectedIndex !== 0)
    RemoveErrorMessage(payment, "label");

  ChangePaymentMethod(selectedIndex);
});

//Form validation
form.addEventListener("submit", (e) => {
  /*-----------Validates Name-----------*/
  const name = document.getElementById("name");
  const isNameEmpty = name.value === "";              //Checkes if a name is entered

  CreateOrRemoveErrorMessage(isNameEmpty, name, "label", "(Please provide a name)", e);

  /*-----------Validates Email-----------*/
  const email = document.getElementById("mail");
  const emailValue = email.value;
  const atpos = emailValue.indexOf("@");
  const dotpos = emailValue.lastIndexOf(".");

  let isEmailInvalid;
  let emailErrorMessage;

  if(emailValue === ""){                              //Checks if no email is entered
    isEmailInvalid = true;
    emailErrorMessage = "(Email can not be empty)";
  }

  else{
    //Checkes if the email is valid by making sure that there is an "@" and that it's not the first character. It checks if the dot is at least two characters after the "@" to make sure
    //that a domain is entered. It finally checkes if there is at least two characters after the dot for the tld(e.g. .com or .org)
    isEmailInvalid = atpos < 1 || dotpos < atpos + 2 || dotpos + 2 >= emailValue.length;
    emailErrorMessage = "(Please enter a valid email adress)";
  }

  CreateOrRemoveErrorMessage(isEmailInvalid, email, "label", emailErrorMessage, e);

  /*-----------Checks if a T-Shirt has been selected-----------*/
  const isADesignChosen = design.value === "Select Theme";    //Checkes if a theme on the T-Shirt has been chosen
  CreateOrRemoveErrorMessage(isADesignChosen, design, "legend", "Dont forget to pick a T-Shirt", e);

  /*-----------Checkes if no checkbox has been checked-----------*/
  let isNoCheckboxChecked = true;
  for(let i = 0; i < checkboxArray.length; i++){
    if(checkboxArray[i].checkbox.checked){                    //Checkes if any checkbox is checked
      isNoCheckboxChecked = false;
      break;
    }
  }

  //It doesn't matter which checkbox is sent as a parameter, as long as one is sent since they all have the same grandparent
  CreateOrRemoveErrorMessage(isNoCheckboxChecked, checkboxArray[0].checkbox, "legend", "Please select an activity", e);

  /*-----------Checkes that a payment method has been chosen-----------*/
  let isNoPaymentMethodChosen = false;
  const paymentValue = payment.value
  if(paymentValue === "select_method"){
    isNoPaymentMethodChosen = true;
    CreateOrRemoveErrorMessage(isNoPaymentMethodChosen, payment, "label", "(Please select a payment mehtod)", e);
  }

  //Validates the length of the credit card's credidentials
  else if(paymentValue === "credit card"){
    let isNumberWrongLength = false;

    for(let i = 0; i < creditCardInputs.length; i++){
      const lengthOfValue = GetCreditCardLength();

      //The credit card number
      if(i === 0)
        isNumberWrongLength = lengthOfValue < 13 || lengthOfValue > 16;         //Checks the creditcard number's length

      else{
        let amountCharacters;
        if(i === 1)               //The zip code
          amountCharacters = 5;

        else                      //The CVV
          amountCharacters = 3

        isNumberWrongLength = creditCardInputs[i].value.length !== amountCharacters ? true : false;
      }

      CreateOrRemoveErrorMessage(isNumberWrongLength, creditCardInputs[i], "label", "", e)
    }
  }
});

let isInputNotValid = false;
let errorText;

//Limits the credit card fields to numbers only
for(let i = 0; i < creditCardInputs.length; i++){
  creditCardInputs[i].addEventListener("keydown", (e) => {
    const key = e.keyCode;

    //Characters created with alt and shift are not allowed except for shift + tab(keyCode = 9). The only buttons that are allowed to be pressed are keyboard and numpad numbers,
    //backspace, tab and ctrl(in case you want to do ctrl + backspace and remove everything written)
    if(!e.altKey && (!e.shiftKey || (e.shiftKey && key === 9)) && ((key >= 48 && key <= 57) || (key >= 96 && key <= 105)  || key === 8 || key === 9 || key === 17))
      isInputNotValid = false;

    else{
      isInputNotValid = true;

      if(i === 0)
        errorText = "Numbers only!";

      else
        errorText = "";             //No error text is shown for the zip and cvv because the design gets broken when applying error messages that are too long

      //The reason for calling this method here is because if the input is a valid key this method will be called once more in the keyup event and also
      //if it is called outside of the else block the error message will "blink" when the user types which does not look good
      CreateOrRemoveErrorMessage(isInputNotValid, creditCardInputs[i], "label", errorText , e);
    }
  });
}

/*
  A keyup event is added to the credit card number input field that checks if the entered number is between 13 and 16 characters long.
  The reason this validation is in the keyup event is because in the keydown event, the pressed button is not yet added to the entered value and because of that
  the value would always be 1 character too short or too long. This design only applies to the first credit card field because the design gets broken when the
  errors messages are applied to the other fields.
*/
creditCardInputs[0].addEventListener("keyup", (e) => {
  //This code is only executed if the input in the keydown event was valid
  if(!isInputNotValid){
    isInputNotValid = true;
    let creditCardLength = GetCreditCardLength();

    if(creditCardLength < 13)
      errorText = "Too short!";

    else if(creditCardLength > 16)
      errorText = "Too long!";

    else
      isInputNotValid = false;

    CreateOrRemoveErrorMessage(isInputNotValid, creditCardInputs[0], "label", errorText , null);
  }
});

/*-------------------Visual changes at load-------------------*/


//The null value makes the total cost display below all the activities
activities[0].parentNode.parentNode.insertBefore(totalActivityCostElement, null);
totalActivityCostElement.textContent = "Total: $0";

//Hides the text field when selecting other in job role and the select menu containing the colors for the T-Shirt
ChangeDisplayValue(otherTitle, "none");
ChangeDisplayValue(colorDiv, "none");

//When -1 is sent as parameter, all payment methods will be hidden
ChangePaymentMethod(-1);

/*
  This for loop removes the explaining parenthesies (Js Puns shirt only) and (I ♥ JS shirt only) from the options in the color select.
  This is beacuse the when the user selects a design, only those colors that are available will be shown and thus the explaining parenthesies are redundant.
  The reason too why these parenthesies aren't removed in the markup is because if javascript isn't available for the user,
  then the user would not know which colors belongs to which design.
*/
for(let i = 0; i < colorOptions.length; i++){
  const currentColor = colorOptions[i].innerHTML;
  const trimmedColor = currentColor.substring(0, currentColor.indexOf("(") - 1);    //The index is subtracted by one to remove the space to the left of the parenthesies
  colorOptions[i].innerHTML = trimmedColor;
}
