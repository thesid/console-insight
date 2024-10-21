# console-insight

Console Insight
Console Insight is a robust, flexible library designed to provide developers with enhanced visibility into their applications. It offers a real-time debugging window that allows you to display console logs and network calls in a floating UI element. This solution is particularly useful in development environments where insights into the application's behavior are critical, but the standard console does not provide sufficient context.

Features
Real-time console log display: View all the log output directly on your application’s UI.
Network calls tracking: Monitor all outgoing and incoming network calls in real time.
Floating, transparent debug window: A convenient and customizable UI element that can be displayed on top of your application without obstructing the user interface.
Configurable and lightweight: Easily turn the debugging window on and off or customize it according to your needs.
Requirements
Node.js (v14+)
React (v17+)
TypeScript (v4.0+)
npm or yarn for dependency management
Installation
To include Console Insight in your project, you can install it directly from npm:

bash
Copy code
npm install console-insight
Alternatively, if you prefer using yarn:

bash
Copy code
yarn add console-insight
Usage
Here is a quick start guide on how to use Console Insight in your React application:

Import the library into your project:

typescript
Copy code
import { DebugWindow } from 'console-insight';
Add the Debug Window component to your application:

typescript
Copy code
function App() {
  return (
    <div className="App">
      {/* Your app content */}
      <DebugWindow />
    </div>
  );
}

export default App;
Configure the Debug Window if needed:

The debug window can be customized to suit your needs. You can pass options such as its transparency, position, and whether to auto-hide based on user interactions.

typescript
Copy code
<DebugWindow
  autoHide={true}
  position="bottom-right"
  transparency={0.8}
/>
How to Run the Application
Prerequisites
Ensure that you have the following installed:

Node.js (v14+)
npm (v6+) or yarn
Steps to Run
Clone the repository:

bash
Copy code
git clone https://github.com/yourusername/console-insight.git
Navigate to the project directory:

bash
Copy code
cd console-insight
Install dependencies: Using npm:

bash
Copy code
npm install
Or using yarn:

bash
Copy code
yarn install
Start the development server: For React projects:

bash
Copy code
npm start
Or:

bash
Copy code
yarn start
Access the app: Open your browser and navigate to http://localhost:3000 to see your application in action, with the Console Insight debug window visible.

Building for Production
To build the application for production:

bash
Copy code
npm run build
The build output will be in the dist/ folder, optimized for deployment.

![image](https://github.com/user-attachments/assets/8fab1cde-359d-4744-b19e-cca07cec30df)

Contributing
Contributions to this project are welcome! Please fork the repository, create a feature branch, and submit a pull request for review. For major changes, please open an issue first to discuss what you would like to change.

License
This project is licensed under the MIT License.
