# Patreon Color Themes

"Patreon Color Themes" is a free and open-source Google Chrome extension for applying custom color themes to the Patreon website.

If you have suggestions or problems using the extension, please [submit a bug or a feature request](https://github.com/naztar0/PatreonColorThemes/issues/).

### Chrome Web Store

"Patreon Color Themes" is [available via the official Chrome Web Store](https://chrome.google.com/webstore/detail/emdlpaekhliohajnmgbgeeohckgblifh).

### Install as an extension from source

1. Download the **[latest available version](https://github.com/naztar0/PatreonColorThemes/releases)** and unarchive to your preferred location.
2. Using **Google Chrome** browser, navigate to chrome://extensions/ and enable "Developer mode" in the upper right corner.
3. Click on the <kbd>Load unpacked extension...</kbd> button.
4. Browse to the src directory of the unarchived folder and confirm.

### Build from GitHub

Clone the repository and run these commands:
```
npm install
cp .env.example .env
```

Then edit the .env file and set `DEBUG=true` to enable debug mode.

Now that you've set up your project, it's time to give it a test run in the browser. To do this, run:
```
npm run dev
```

This will start a local web server on port 5173. You can now open your browser and navigate to [Patreon](https://www.patreon.com) to test the extension.

To build the extension, run:
```
npm run build
```

Then copy the `_locales` directory to the `dist` directory.
To install the extension, follow the instructions in the previous section.

### Contributing to this extension

Contributions are welcome. Feel free to submit pull requests for new features and bug fixes. For new features, ideally you would raise an issue for the proposed change first so that we can discuss ideas.
