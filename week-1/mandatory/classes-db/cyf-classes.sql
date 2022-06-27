create table mentors (
	id SERIAL primary key,
	name VARCHAR(30) NOT NULL,
	years_in_glasgow SMALLINT not null,
	favourite_language VARCHAR(25) not null,
	address VARCHAR(100) not null
);

insert into mentors ();
insert into mentors (Students) values ('');

INSERT INTO mentors (name, years_in_glasgow, address, favourite_language) 
VALUES ('Mary', 10, 'carrer nou 23', 'React' );
INSERT INTO mentors (name, years_in_glasgow, address, favourite_language) 
VALUES ('Mark', 12, 'santa Clara 40', 'Python' );
INSERT INTO mentors (name, years_in_glasgow, address, favourite_language) 
VALUES ('Gloria', 5, 'Santa Clara', 'Java' );
INSERT INTO mentors (name, years_in_glasgow, address, favourite_language) 
VALUES ('Eva', 5, '44 Streets', 'C++' );
INSERT INTO mentors (name, years_in_glasgow, address, favourite_language) 
VALUES ('John', 10, 'Santa Maria', 'Javascript' );

select * from mentors 

create table students(
	id SERIAL primary key,
	name VARCHAR(30) NOT NULL,
	address VARCHAR(100) not null,
	graduated_from_code_your_future BOOLEAN
);

INSERT INTO students (name, address, graduated_from_code_your_future) VALUES ('Isha', '2 High Road',true);
INSERT INTO students (name, address, graduated_from_code_your_future) VALUES ('Kose', 'Sant Joan 6',false);
INSERT INTO students (name, address, graduated_from_code_your_future) VALUES ('Ali', 'saint Johns',true);
INSERT INTO students (name, address, graduated_from_code_your_future) VALUES ('Kate', 'carrer nou 5',true);
INSERT INTO students (name, address, graduated_from_code_your_future) VALUES ('Diego', '5 street',true);
INSERT INTO students (name, address, graduated_from_code_your_future) VALUES ('Alice', 'sant pedro 58',false);
INSERT INTO students (name, address, graduated_from_code_your_future) VALUES ('Xavi', 'caarrer Marc 2',false);
INSERT INTO students (name, address, graduated_from_code_your_future) VALUES ('Vane', 'carrer nou 54',true);
INSERT INTO students (name, address, graduated_from_code_your_future) VALUES ('Alice', 'carrer de vic 74',true);
INSERT INTO students (name, address, graduated_from_code_your_future) VALUES ('Matthew', 'carrer nou 20',true);

select * from students

create table classes (
	id SERIAL primary key,
	-- A class has a leading mentor
	mentor_id INT references mentors(id),
	topic varchar(50) not null,
	-- A class is taught at a specific date and at a specific location
	date   DATE NOT NULL,
  	location VARCHAR(50) NOT NULL
);

INSERT INTO classes (mentor_id, topic, date, location) VALUES (1, 'Python','2021-11-11','Barcelona');
INSERT INTO classes (mentor_id, topic, date, location) VALUES (2, 'Javascript','2021-08-11','Barcelona');
INSERT INTO classes (mentor_id, topic, date, location) VALUES (3, 'NodeJs','2021-09-11','Barcelona');
INSERT INTO classes (mentor_id, topic, date, location) VALUES (4, 'React','2021-10-11','Barcelona');

select * from classes

create table attendance (
	id SERIAL primary key,
	student_id int references students(id),
	class_id int references classes(id)
);

insert into attendance (student_id, class_id) values (4, 2);
insert into attendance (student_id, class_id) values (1, 3);
insert into attendance (student_id, class_id) values (10, 1);
insert into attendance (student_id, class_id) values (5, 2);

-- mentors who have lived in glasgrow for more than 5 years
select * from mentors 

select * from mentors where years_in_glasgow > 5;

select * from mentors 

--Retrieve all the mentors whose favourite language is Javascript

select * from mentors
where favourite_language  = 'Javascript';

--Retrieve all the students who are CYF graduates

select * from students 
where  graduated_from_code_your_future is true ;

--Retrieve all the classes taught before June this year

select * from classes
where date <'2021-06-01';

--Retrieve all the students (retrieving student ids only is fine) who attended the Javascript class (or any other class that you have in the classes table)

select  student_id from attendance 
where class_id = 1;



