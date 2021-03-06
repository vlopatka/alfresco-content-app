/*!
 * @license
 * Alfresco Example Content Application
 *
 * Copyright (C) 2005 - 2020 Alfresco Software Limited
 *
 * This file is part of the Alfresco Example Content Application.
 * If the software was purchased under a paid Alfresco license, the terms of
 * the paid license agreement will prevail.  Otherwise, the software is
 * provided under the following open source license terms:
 *
 * The Alfresco Example Content Application is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * The Alfresco Example Content Application is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Alfresco. If not, see <http://www.gnu.org/licenses/>.
 */

import { browser, protractor, ElementFinder, ExpectedConditions as EC, by, logging } from 'protractor';
import { Logger } from '@alfresco/adf-testing';
import { BROWSER_WAIT_TIMEOUT, E2E_ROOT_PATH, EXTENSIBILITY_CONFIGS } from '../configs';

const path = require('path');
const fs = require('fs');
const StreamZip = require('node-stream-zip');

export const isPresentAndEnabled = async (element: ElementFinder): Promise<boolean> => {
  const isPresent = await element.isPresent();

  if (isPresent) {
    return element.isEnabled();
  }

  return false;
};

export const isPresentAndDisplayed = async (element: ElementFinder): Promise<boolean> => {
  const isPresent = await element.isPresent();

  if (isPresent) {
    return element.isDisplayed();
  }

  return false;
};

export class Utils {
  static string257 = 'assembly doctor offender limit clearance inspiration baker fraud active apples trait brainstorm concept breaks down presidential \
    reluctance summary communication patience books opponent banana economist head develop project swear unanimous read conservation';

  static string513 = 'great indirect brain tune other expectation fun silver drain tumble rhythm harmful wander picture distribute opera complication copyright \
    explosion snack ride pool machinery pair frog joint wrestle video referee drive window cage falsify happen tablet horror thank conception \
    extension decay dismiss platform respect ceremony applaud absorption presentation dominate race courtship soprano body \
    lighter track cinema tread tick climate lend summit singer radical flower visual negotiation promises cooperative live';

  // generate a random value
  static random(): string {
    return Math.random().toString(36).substring(5, 10).toLowerCase();
  }

  // local storage
  static async clearLocalStorage(): Promise<void> {
    await browser.executeScript('window.localStorage.clear();');
  }

  // session storage
  static async clearSessionStorage(): Promise<void> {
    await browser.executeScript('window.sessionStorage.clear();');
  }

  static async getSessionStorage(): Promise<any> {
    return browser.executeScript('return window.sessionStorage.getItem("app.extension.config");');
  }

  static async setSessionStorageFromConfig(configFileName: string): Promise<void> {
    const configFile = `${E2E_ROOT_PATH}/resources/extensibility-configs/${configFileName}`;
    const fileContent = JSON.stringify(fs.readFileSync(configFile, { encoding: 'utf8' }));

    await browser.executeScript(`window.sessionStorage.setItem('app.extension.config', ${fileContent});`);
  }

  static async resetExtensionConfig(): Promise<void> {
    const defConfig = `${E2E_ROOT_PATH}/resources/extensibility-configs/${EXTENSIBILITY_CONFIGS.DEFAULT_EXTENSIONS_CONFIG}`;

    await this.setSessionStorageFromConfig(defConfig);
  }

  static retryCall(fn: () => Promise<any>, retry: number = 30, delay: number = 1000): Promise<any> {
    const pause = duration => new Promise(res => setTimeout(res, duration));

    const run = retries => {
      return fn().catch(err => (retries > 1 ? pause(delay).then(() => run(retries - 1)) : Promise.reject(err)));
    }

    return run(retry);
  }

  static async waitUntilElementClickable(element: ElementFinder): Promise<void> {
    await browser.wait(EC.elementToBeClickable(element), BROWSER_WAIT_TIMEOUT).catch(Error);
  }

  static async typeInField(elem: ElementFinder, value: string): Promise<void> {
    for (let i = 0; i < value.length; i++) {
      const c = value.charAt(i);
      await elem.sendKeys(c);
      await browser.sleep(100);
    }
  }

  static async clearFieldWithBackspace(elem: ElementFinder): Promise<void> {
    const text = await elem.getAttribute('value');
    for (let i = 0; i < text.length; i++) {
      await elem.sendKeys(protractor.Key.BACK_SPACE);
    }
  }

  static async fileExistsOnOS(fileName: string, folderName: string = '', subFolderName: string = ''): Promise<any> {
    const config = await browser.getProcessedConfig();
    const filePath = path.join(config.params.downloadFolder, folderName, subFolderName, fileName);

    let tries = 15;

    return new Promise(function(resolve) {
      const checkExist = setInterval(() => {
        fs.access(filePath, function(error) {
          tries--;

          if (error && tries === 0) {
            clearInterval(checkExist);
            resolve(false);
          }

          if (!error) {
            clearInterval(checkExist);
            resolve(true);
          }
        });
      }, 500);
    });
  }

  static async renameFile(oldName: string, newName: string): Promise<void> {
    const config = await browser.getProcessedConfig();
    const oldFilePath = path.join(config.params.downloadFolder, oldName);
    const newFilePath = path.join(config.params.downloadFolder, newName);

    const fileExists = await this.fileExistsOnOS(oldName);

    if (fileExists) {
      fs.rename(oldFilePath, newFilePath, function (err) {
        if (err) {
          Logger.error('==== rename err: ', err);
        }
      });
    }
  }

  static async unzip(filename: string, unzippedName: string = ''): Promise<void> {
    const config = await browser.getProcessedConfig();
    const filePath = path.join(config.params.downloadFolder, filename);
    const output = path.join(config.params.downloadFolder, unzippedName ? unzippedName : '');

    const zip = new StreamZip({
      file: filePath,
      storeEntries: true
    });

    await zip.on('error', err => { Logger.error('=== unzip err: ', err) });

    await zip.on('ready', async () => {
      if (unzippedName) {
        await fs.mkdirSync(output);
      }
      await zip.extract(null, output, async () => {
        await zip.close();
      });
    });
  }

  static async pressEscape(): Promise<void> {
    await browser.actions().sendKeys(protractor.Key.ESCAPE).perform();
  }

  static async pressTab(): Promise<void> {
    await browser.actions().sendKeys(protractor.Key.TAB).perform();
  }

  static async pressCmd(): Promise<void> {
    await browser.actions().sendKeys(protractor.Key.COMMAND).perform();
  }

  static async releaseKeyPressed(): Promise<void> {
    await browser.actions().sendKeys(protractor.Key.NULL).perform();
  }

  static async getBrowserLog(): Promise<logging.Entry[]> {
    return browser.manage().logs().get('browser');
  }

  static formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US');
  }

  static async uploadFileNewVersion(fileFromOS: string): Promise<void> {
    const el = browser.element(by.id('app-upload-file-version'));
    await el.sendKeys(`${E2E_ROOT_PATH}/resources/test-files/${fileFromOS}`);
  }

}
