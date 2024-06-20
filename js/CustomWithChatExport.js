//let webChatInstance;
// We want to keep track of all the buttons in our last response so we can disable them if the user sends a message
// to advance the conversation.
// When session history is loaded, we want to disable all the buttons so they can't be used again. We will set this
// flag to true as soon as the user sends a message.
//let hasSentMessage = false;

function preReceiveHandler(event) {
    const message = event.data;
    if (message.output.generic) {
      message.output.generic.forEach(messageItem => {
        if (messageItem.response_type === 'option') {
          messageItem.response_type = 'user_defined';
        }
      })
    }
  }

     /**
     * This function will be called when the user clicks on one of the buttons.
     */
     function onClick(messageItem, button, fullMessage, itemIndex) {
      // Send a message to the assistant with the label of the button. You can also add "{ silent: true }" as the second
      // argument if you don't want this message to appear as a "sent" bubble from the user. See
      // https://web-chat.global.assistant.watson.cloud.ibm.com/docs.html?to=api-instance-methods for more
      // information about the instance methods.
       webChatInstance.send({ input: { text: messageItem.label }});

      // Make the button appear
      button.classList.add('CardButton--selected');

      // Send an update event to the assistant. This will update session history for this message so it remembers what
      // button was clicked.
       webChatInstance.updateHistoryUserDefined(fullMessage.id, { selectedIndex: itemIndex });
    }

    function customResponseHandler(event) {
      const { message, element, fullMessage } = event.data;
      message.options.forEach((messageItem, index) => {
        const button = document.createElement('button');
        button.innerHTML = messageItem.label;
      //  button.classList.add('CardButton');
        //button.addEventListener('click', () => onClick(messageItem, button,     fullMessage, index));
        element.appendChild(button);
      });
    }
    
  
 /**
     * This function will set up the custom element that will be displayed on the home screen.
     */
 function createHomeScreenElement(instance) {
 
  const title = document.createElement('div');
  title.classList.add('HSTitle');
  title.innerHTML = 'Quick Links';

  const articles = document.createElement('div');
 
  articles.classList.add('HSArticles');
  articles.appendChild(createLink('&#x1F6D2;', 'Our Services', '#services-section'));
  articles.appendChild(createLink('&#x1F9FE;', 'Investments', '#investment-section'));
  articles.appendChild(createLink('&#x2754;', 'About Us', '#about-section'));

  const container = document.createElement('div');
  container.classList.add('HSContainer');
  container.classList.add('rounded');
  container.appendChild(title);
  container.appendChild(articles);
 

 
  // This is what adds this custom content to web chat. The "homeScreenAfterStartersElement" element is a writeable
  // area that appears at the bottom of the home screen below the starters.
  instance.writeableElements.homeScreenAfterStartersElement.appendChild(container);
}

/**
 * This creates a button that can be displayed in the custom element on the home screen.
 */
function createLink(icon, label, href) {
  const link = document.createElement('a');
  link.href = href;
  link.target = '_self';
  link.classList.add('HSContainer__Link');
  // All IBM Carbon class names (https://carbondesignsystem.com/) are automatically available for use inside of
  // web chat and will inherit theming values you have set on web chat.
  link.classList.add('cds--link');
  link.classList.add('p-2');
  link.classList.add('cds--btn--ghost');
  link.classList.add('cds--chat-btn');
  link.innerHTML = `<span class="HSContainer__LinkIcon">${icon}</span>${label}`;

  return link;
}


function uploadFileFromAsst(selectedFile) {
  if (selectedFile) {
    const formData = new FormData();
    formData.append("uploaded_file", selectedFile);

    //Invoke server endpoint to upload file
    const SERVER = "https://ibm.ent.box.com/folder/159811892913";
    fetch(SERVER, {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("File upload failed.");
        }
      })
      .then(async (data) => {
        var msg = data["msg"] ? data["msg"] : "";
        if (!msg) {
          alert("File upload error. Please try after some time.");
          return;
        }
        messageChatbot(msg, true);
      })
      .catch((error) => {
        console.error("Error while file uploading: ", error);
      });
  } else {
    console.error("No file selected.");
  }
}

function fileUploadCustomResponseHandler(event, instance) {
  const { element } = event.data;

  element.innerHTML = `
        <div>
            <input type="file" id="uploadInput" style="display: none;">
            <button id="uploadButton" class="cds--chat-btn cds--chat-btn--quick-action cds--btn cds--btn--sm cds--layout--size-sm cds--btn--ghost"> Upload a File </button>
        </div>`;

  const uploadInput = element.querySelector("#uploadInput");
  const button = element.querySelector("#uploadButton");
  button.addEventListener("click", () => {
    uploadInput.click();
  });
  uploadInput.addEventListener("change", (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      // You can access the selected file using selectedFile variable
      // console.log("Selected file:", selectedFile.name);
      uploadFileFromAsst(selectedFile);
    }
  });
}

function messageChatbot(txt, silent = false) {
  const maxChars = 2040;
  txt = txt.substring(0, maxChars);
  var send_obj = { input: { message_type: "text", text: txt } };

  g_wa_instance.send(send_obj, { silent }).catch(function (error) {
    console.error("Sending message to chatbot failed");
  });
}

  // We are going to save the message history here.
  let messages = [];
  let agentMessages = [];

  /**
     * This function will save all the messages that came from session history. These are messages that are loaded if
     * the web page is re-loaded or the user navigates to a different page in the middle of a conversation. This does
     * not include messages with a human agent which are not stored in session history.
     */
  function saveHistory(event) {
    messages.push(...event.messages);
  }

  /**
   * This function will save each message that is generated by the send and receive events.
   */
  function saveMessage(event) {
    messages.push(event.data);
  }

  /**
   * This function will save each message that is generated by the send and receive events with a human agent.
   */
  function saveAgentMessage(event) {
    agentMessages.push({
      ...event.data,
      // Add the agent's nickname to this object to make it easier to process both the bot and agent messages.
      agentNickname: (event.agentProfile && event.agentProfile.nickname) || 'Agent',
    });
  }

  /**
   * This function will be called when the user selects the "Download history" custom menu option.
   */
  function createDownload() {
    let downloadLines = [];
    downloadLines.push('Assistant messages')
    downloadLines.push(createDownloadText('From', 'Message'));

    downloadLines = downloadLines.concat(messagesToLines(messages));

    if (agentMessages.length) {
      // If there are any messages with a human agent, add those to the export.
      downloadLines.push('');
      downloadLines.push('Human agent messages');
      downloadLines.push(createDownloadText('From', 'Message'));
      downloadLines = downloadLines.concat(messagesToLines(agentMessages));
    }

    return downloadLines.join('\n');
  }

  /**
   * Converts the given array of messages into an array of "lines" that will correspond to lines in the output file.
   */
  function messagesToLines(messages) {
    // We're going to create a comma-separate-value file (CSV). The first column will indicate if the message came
    // from the user or if it came from the bot. The second column will be the text of the message. This code here
    // only supports text responses but it can be updated to support additional types of messages such as "option"
    // responses (buttons and dropdowns) or "connect_to_agent" response. You can find more information about the
    // possible types of responses here: https://cloud.ibm.com/apidocs/assistant/assistant-v2#message-response.
    const downloadLines = [];

    messages.forEach(message => {
      if (message.input && message.input.text) {
        // This is a message that came from the user.
        downloadLines.push(createDownloadText('You', message.input.text));
      } else if (message.output && message.output.generic && message.output.generic.length) {
        // This is a message that came from the assistant or an agent. It can contain an array of individual message items.
        const systemName = message.agentNickname || 'WB Digital Assistant';
        message.output.generic.forEach(messageItem => {
          // This is only handling a text response but you can handle other types of responses here as well as
          // custom responses.
          if (messageItem && messageItem.text) {
            downloadLines.push(createDownloadText(systemName, messageItem.text));
           
          }
        });
      }
    });

    return downloadLines;
  }

  /**
   * This function will perform a download of the user's chat history. This is called when the user chooses the
   * custom option from the menu.
   */
  function doDownload() {
    const downloadContent = createDownload();
    const blob = new Blob([downloadContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    // To automatically trigger a download, we have to create a fake "a" element and then click it.
    const timestamp = new Date().toISOString().replace(/[_:]/g, '-').replace(/.[0-9][0-9][0-9]Z/, '');
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `Chat History ${timestamp}.csv`);
    a.click();
  }

  /**
   * Escapes the given piece of text so it can safely be displayed in a CSV file.
   */
  function escapeCSV(text) {
    // Remove any newline characters which aren't supported in all CSV formats.
    text = text.replace(/\n/g, ' ');

    // If the text contains a comma or a double quote, the entire thing needs to be surrounded by double quotes. If
    // the string contains a double quote, then each double quote needs to be replaced with two double quotes.
    if (text.match(/[,"]/)) {
      return `"${text.replace(/"/g, '""')}"`;
    }
    return text;
  }

  /**
   * Creates a single row of text that will appear in the output file.
   */
  function createDownloadText(from, text) {
    return `${from},${escapeCSV(text)}`;
  }

var g_wa_instance;
window.watsonAssistantChatOptions = {
    integrationID: "7f393ba4-5df4-4027-aac3-26e58be558f9", // The ID of this integration.
    region: "aws-us-east-1", // The region your integration is hosted in.
    serviceInstanceID: "20240313-1416-3826-1055-26022b1c41ef", // The ID of your service instance.
    showRestartButton: true,
    
    onLoad: async (instance) => {
        // The instance returned here has many methods on it that are documented on this page. You can assign it to any
        // global window variable you like if you need to access it in other functions in your application. This instance
        // is also passed as an argument to all event handlers when web chat fires an event.
        createHomeScreenElement(instance);
        function receive(event) {
          var contactNumber =
            event.data.context.skills["main skill"].user_defined.contactNumber;


          if (contactNumber != "") {
           // document.getElementById("background").style.display = "none";
           // document.getElementById("wa-output-summ-title").innerHTML =
           //   "<b>Summary</b>";
            document.getElementById("about-section").click();
          }
    

        }
        instance.on({ type: 'send', handler: saveMessage });
        instance.on({ type: 'receive', handler: saveMessage });
        instance.on({ type: 'agent:send', handler: saveAgentMessage });
        instance.on({ type: 'agent:receive', handler: saveAgentMessage });
        instance.on({ type: 'history:begin', handler: saveHistory });
      // instance.on({ type: 'customResponse', handler: customResponseHandler });
        instance.on({ type: 'pre:receive', handler: preReceiveHandler });
 
        instance.updateCustomMenuOptions([{ text: 'Download transcript', handler: doDownload }]);
        
        // instance.on({ type: "customResponse",
        //   handler: (event, instance) => {
        //     if (
        //       event.data.message.user_defined &&
        //       event.data.message.user_defined.user_defined_type ===
        //         "user-file-upload"
        //     ) 
        //     {
        //       fileUploadCustomResponseHandler(event, instance);
        //     }
        //   }, 
        // });
        await instance.render();
     }
  };


  setTimeout(function(){
    const t=document.createElement('script');
    t.src="https://web-chat.global.assistant.watson.appdomain.cloud/versions/" + (window.watsonAssistantChatOptions.clientVersion || 'latest') + "/WatsonAssistantChatEntry.js";
    document.head.appendChild(t);
  });

