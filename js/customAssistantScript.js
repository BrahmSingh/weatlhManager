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
      await instance.render();
   }
};


setTimeout(function(){
  const t=document.createElement('script');
  t.src="https://web-chat.global.assistant.watson.appdomain.cloud/versions/" + (window.watsonAssistantChatOptions.clientVersion || 'latest') + "/WatsonAssistantChatEntry.js";
  document.head.appendChild(t);
});

