<!--
 Copyright (c) 2025 KibaOfficial
 
 This software is released under the MIT License.
 https://opensource.org/licenses/MIT
-->

# Kio-QR

Kio-QR is a simple QR code generator written in Typescript. It is made by me to better understand how QR codes work. It is not meant to be a production-ready library, but rather a learning tool. It is not recommended to use this library in production, as it may not be fully compliant with the QR code standard.

--

## Table of Contents

- [Kio-QR](#kio-qr)
  - [Table of Contents](#table-of-contents)
  - [Installation](#installation)
  - [Usage](#usage)
  - [License](#license)
  - [Contributing](#contributing)
  - [Acknowledgements](#acknowledgements)


## Installation
To install Kio-QR, run the following command:

```bash
git clone https://github.com/kibaofficial/kio-qr.git
cd kio-qr
npm install
```

## Usage
To use Kio-QR, you can import the `KioQR` class and create a new instance of it. You can then call the `generate` method to generate a QR code.

```typescript
import { KioQR } from './src/KioQR';

const qr = new KioQR();
const data = 'https://kibaofficial.net';
const qrCode = qr.generate(data);
console.log(qrCode);
```

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contributing
If you would like to contribute to Kio-QR, please fork the repository and create a pull request. All contributions are welcome!

## Acknowledgements
This project was inspired by the [QR Code Standard](https://www.qrcode.com/en/about/).

This project was created by [KibaOfficial](https://github.com/kibaofficial).