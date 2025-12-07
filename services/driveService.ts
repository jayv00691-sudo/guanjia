
import { PokerSession, PokerHand, Currency, ExchangeRates, Language, ThemeColor } from '../types';

const SCOPES = 'https://www.googleapis.com/auth/drive.file';
const FILE_NAME = 'hao_poker_backup.json';

export interface DriveData {
  sessions: PokerSession[];
  hands: PokerHand[];
  settings: {
    userCurrency: Currency;
    exchangeRates: ExchangeRates;
    lang: Language;
    themeColor: ThemeColor;
    userApiKey: string;
    googleClientId: string;
  };
  updatedAt: number;
}

declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

export const initGapiClient = async () => {
  return new Promise<void>((resolve, reject) => {
    if (!window.gapi) {
      reject("GAPI not loaded");
      return;
    }
    window.gapi.load('client', async () => {
      try {
        await window.gapi.client.init({
          discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
        });
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  });
};

export const uploadDataToDrive = async (data: DriveData, accessToken: string): Promise<void> => {
  if (!window.gapi || !window.gapi.client || !window.gapi.client.drive) {
    throw new Error("Google Drive API not initialized");
  }

  window.gapi.client.setToken({ access_token: accessToken });

  // 1. Search for existing file
  const listResponse = await window.gapi.client.drive.files.list({
    q: `name = '${FILE_NAME}' and trashed = false`,
    fields: 'files(id, name)',
    spaces: 'drive',
  });

  const files = listResponse.result.files;
  const fileContent = JSON.stringify(data, null, 2);
  const fileMetadata = {
    name: FILE_NAME,
    mimeType: 'application/json',
  };

  if (files && files.length > 0) {
    // Update existing file
    const fileId = files[0].id;
    await window.gapi.client.request({
      path: `/upload/drive/v3/files/${fileId}`,
      method: 'PATCH',
      params: { uploadType: 'media' },
      body: fileContent,
    });
  } else {
    // Create new file
    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(fileMetadata)], { type: 'application/json' }));
    form.append('file', new Blob([fileContent], { type: 'application/json' }));

    // Using fetch for creation to handle multipart upload easier than gapi sometimes
    await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: new Headers({ 'Authorization': 'Bearer ' + accessToken }),
      body: form
    });
  }
};

export const loadDataFromDrive = async (accessToken: string): Promise<DriveData> => {
  if (!window.gapi || !window.gapi.client || !window.gapi.client.drive) {
    throw new Error("Google Drive API not initialized");
  }

  window.gapi.client.setToken({ access_token: accessToken });

  const listResponse = await window.gapi.client.drive.files.list({
    q: `name = '${FILE_NAME}' and trashed = false`,
    fields: 'files(id, name)',
    spaces: 'drive',
  });

  const files = listResponse.result.files;
  if (!files || files.length === 0) {
    throw new Error("No backup file found");
  }

  const fileId = files[0].id;
  const response = await window.gapi.client.drive.files.get({
    fileId: fileId,
    alt: 'media',
  });

  return response.result as DriveData;
};
