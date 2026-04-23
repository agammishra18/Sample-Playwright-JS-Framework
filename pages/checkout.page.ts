import { Page } from '@playwright/test';
import { BasePage } from './base.page';
import { Logger } from '../utils/logger';

export interface CheckoutInfo {
  firstName: string;
  lastName: string;
  postalCode: string;
}

export class CheckoutPage extends BasePage {
  private readonly firstNameInput = '[data-test="firstName"]';
  private readonly lastNameInput = '[data-test="lastName"]';
  private readonly postalCodeInput = '[data-test="postalCode"]';
  private readonly continueButton = '[data-test="continue"]';
  private readonly finishButton = '[data-test="finish"]';
  private readonly completeHeader = '[data-test="complete-header"]';

  constructor(page: Page) {
    super(page);
  }

  async fillShippingInfo(info: CheckoutInfo): Promise<void> {
    Logger.step(`Fill shipping info for ${info.firstName} ${info.lastName}`);
    await this.fill(this.firstNameInput, info.firstName);
    await this.fill(this.lastNameInput, info.lastName);
    await this.fill(this.postalCodeInput, info.postalCode);
    await this.click(this.continueButton);
  }

  async completeOrder(): Promise<void> {
    await this.click(this.finishButton);
  }

  async getCompletionMessage(): Promise<string> {
    return this.getText(this.completeHeader);
  }
}
