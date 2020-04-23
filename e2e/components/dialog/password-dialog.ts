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

import { by, browser } from 'protractor';
import { GenericDialog } from '../dialog/generic-dialog';
import { waitForClickable } from '../../utilities/utils';

export class PasswordDialog extends GenericDialog {
  private static selectors = {
    closeButton: by.css('[data-automation-id="adf-password-dialog-close"]'),
    submitButton: by.css('[data-automation-id="adf-password-dialog-submit"]')
  };

  passwordInput = this.rootElem.element(by.css('input[type="Password"]'));
  errorMessage = this.rootElem.element(by.css('.mat-error'));

  constructor() {
    super('adf-pdf-viewer-password-dialog');
  }

  async waitForDialogToOpen(): Promise<void> {
    await super.waitForDialogToOpen();
    await waitForClickable(this.passwordInput);
  }

  async isDialogOpen(): Promise<boolean> {
    try {
      await this.waitForDialogToOpen();
      return true;
    } catch (error) {
      return false;
    }
  }

  async isCloseEnabled(): Promise<boolean> {
    return this.isButtonEnabled(PasswordDialog.selectors.closeButton);
  }

  async isSubmitEnabled(): Promise<boolean> {
    return this.isButtonEnabled(PasswordDialog.selectors.submitButton);
  }

  async clickClose(): Promise<void> {
    await this.clickButton(PasswordDialog.selectors.closeButton);
  }

  async clickSubmit(): Promise<void> {
    await this.clickButton(PasswordDialog.selectors.submitButton);
  }

  async isPasswordInputDisplayed(): Promise<boolean> {
    const present = await browser.isElementPresent(this.passwordInput);
    if (present) {
      return this.passwordInput.isDisplayed();
    } else {
      return false;
    }
  }

  async isErrorDisplayed(): Promise<boolean> {
    try {
      await this.waitForDialogToOpen();
      return (await this.errorMessage.isPresent()) && (await this.errorMessage.isDisplayed());
    } catch (error) {
      return false;
    }

  }

  async getErrorMessage(): Promise<string> {
    if (await this.isErrorDisplayed()) {
      return this.errorMessage.getText();
    }
    return '';
  }

  async enterPassword(password: string): Promise<void> {
    await this.passwordInput.clear();
    await this.passwordInput.sendKeys(password);
  }
}
