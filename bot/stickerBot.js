class StickerBot {
  #axios = require('axios');
  #sharp = require('sharp');

  constructor(token) {
    this.token = token;
    this.#axios.defaults.baseURL = `https://api.telegram.org/bot${token}`;
  }

  async sendMessage(msg, id) {
    const body = {
      chat_id: id,
      text: msg
    };

    try {
      return await this.#axios.post('/sendMessage', body);
    } catch (error) {
      console.error(error);
    }
  }

  async getFile(fileId) {
    const body = {
      file_id: fileId
    };

    try {
      const response = await this.#axios.post('/getFile', body);
      const { data } = response;
      const { result } = data;
      const { file_path } = result;

      return await this.#axios({
        method: 'get',
        url: `https://api.telegram.org/file/bot${this.token}/${file_path}`,
        responseType: 'arraybuffer'
      }).then(response => {
        return new Promise((resolve, reject) => {
          resolve(Buffer.from(response.data, 'binary'));
        });
      });
    } catch (error) {
      console.error(error);
    }
  }

  async resize(file) {
    const image = await this.#sharp(file);
    const metadata = await image.metadata();

    if (metadata.height > metadata.width) {
      return image
        .resize({ height: 512 })
        .toFormat('png')
        .toBuffer();
    } else {
      return image
        .resize({ width: 512 })
        .toFormat('png')
        .toBuffer();
    }
  }
}

module.exports = StickerBot;
