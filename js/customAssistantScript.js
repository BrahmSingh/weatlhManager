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

  function customResponseHandler(event) {
    const { message, element, fullMessage } = event.data;
    message.options.forEach((messageItem, index) => {
      const button = document.createElement('button');
      button.innerHTML = messageItem.label;
      button.classList.add('CardButton');
      button.addEventListener('click', () => onClick(messageItem, button,     fullMessage, index));
      element.appendChild(button);
    });
  }
  

window.watsonAssistantChatOptions = {
    integrationID: "7f393ba4-5df4-4027-aac3-26e58be558f9", // The ID of this integration.
    region: "aws-us-east-1", // The region your integration is hosted in.
    serviceInstanceID: "20240313-1416-3826-1055-26022b1c41ef", // The ID of your service instance.
    onLoad: async (instance) => {
        // The instance returned here has many methods on it that are documented on this page. You can assign it to any
        // global window variable you like if you need to access it in other functions in your application. This instance
        // is also passed as an argument to all event handlers when web chat fires an event.
        
        window.webChatInstance = instance;
        instance.updateCSSVariables({
            'LAUNCHER-color-background': '#525252',
            'LAUNCHER-color-background-hover': '#3d3d3d',
            'LAUNCHER-color-background-active': '#1f1f1f',
            'LAUNCHER-color-focus-border': '#ffffff',
            'LAUNCHER-color-avatar': '#ffffff',
            'LAUNCHER-EXPANDED-MESSAGE-color-background': '#ffffff',
            'LAUNCHER-EXPANDED-MESSAGE-color-background-hover': '#ebebeb',
            'LAUNCHER-EXPANDED-MESSAGE-color-background-active': '#cccccc',
            'LAUNCHER-EXPANDED-MESSAGE-color-focus-border': '#000000',
            'LAUNCHER-EXPANDED-MESSAGE-color-text': '#000000',
            'LAUNCHER-MOBILE-color-text': '#000000',
          });
        await instance.render();
     }
  };
  setTimeout(function(){
    const t=document.createElement('script');
    t.src="https://web-chat.global.assistant.watson.appdomain.cloud/versions/" + (window.watsonAssistantChatOptions.clientVersion || 'latest') + "/WatsonAssistantChatEntry.js";
    document.head.appendChild(t);
  });

  