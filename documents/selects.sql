select login.user, login.date, useragent.useragent, ip.ip from history_login login
	join history_ip ip on login.ip = ip.id_history_ip
    join history_useragent useragent on login.useragent = useragent.id_history_useragent;

select * from history_login;
select * from user;