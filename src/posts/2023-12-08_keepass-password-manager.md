---
title: Keepass as a password manager
date: '2023-12-08'
tags: [security]
oldUrl: /security/2023/12/08/keepass-password-manager
---
For a long time I've been using the integrated password manager in my browser of choice. Starting with Google Chrome, Firefox and ended up on Brave.

<!--more-->

I switch very often from device to device, and even browser to browser. In my quest to not be dependent on some companies, I decided to use an offline password manager, which is [Keepass](https://keepass.info/){target="_blank"}.

The change was intimidating at first, here's how I made the switch.

## Export all passwords
The first step is to log in to whatever is your current password manager, for me I had to log into my Google Account, Firefox and in the Brave settings.
I extracted all passwords in an unsecure CSV file.

## Create the Keepass database
Due to the Keepass nature of being open source, you are confronted with a wide variety of clients.
I chose to use [KeepassXC](https://keepassxc.org/){target="_blank"} for my desktop and laptop, alongside [KeepassDX](https://www.keepassdx.com/){target="_blank"} for my Android Phone.

Both clients supports 2FA with a Yubikey and has a browser integration which were the required features for me.

Once the database is created, I imported the CSV files.

Keepass's main website provide a list of [Contributed/Unofficial KeePass Ports](https://keepass.info/download.html){target="_blank"} which is useful to find a client that meets your needs.

## Syncing the database
One on the main benefits of using a cloud based password manager, is that all your passwords are always synchronized to all your devices. That is not the case with Keepass. You must come up with your own sync solution.
Fortunately, for my case, I already had created and imported most of the main accounts in Keepass, I did not feel the need to sync the database.

More recently I've gathered the 3 databases from my devices, and combined them using the "merge" feature from KeepassXC, this way my new merged database contains all the new passwords.

KeepassDX has a great wiki page that explains [how to sync the database](https://github.com/Kunzisoft/KeePassDX/wiki/File-Manager-and-Sync#synchronization-application){target="_blank"}.

## Conclusion

Overall, using Keepass makes it easier to switch browser, but not device. It is also way more secure than using a cloud-based solution.
