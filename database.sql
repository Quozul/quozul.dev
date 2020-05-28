create database if not exists `quozul.dev`;

use `quozul.dev`;

create table if not exists `visits` (
    id integer auto_increment primary key,
    date datetime,
    ip varchar(15),
    page varchar(255),
    country char(2),
    city varchar(64),
    browser_name varchar(32),
    browser_version varchar(16),
    os_name varchar(16),
    os_version varchar(16)
);

-- insert into `visits` (date, ip, page, country, city, browser_name, browser_version, os_name, os_version) values (?, ?, ?, ?, ?);