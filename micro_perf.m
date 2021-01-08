clear;
clc;

micro_data = csvread('micro_test.csv',1);
data_len = micro_data(:,1);
constraints = micro_data(:,2);
points = micro_data(:,3);
% ms -> s
genparam = micro_data(:,4)/1000;
provedata = micro_data(:,5)/1000;
verifyproof = micro_data(:,6)/1000;

sc_data = csvread('sc_test.csv',1);
smartcontract = sc_data(:,2)/1000;

subplot(3,1,1);
b0=bar(data_len(5:5:end),genparam(5:5:end));
b0.FaceColor=[0.2148 0.7187 0.6132];
%plot(data_len,genparam,'LineWidth',2,'Color',[0.2148 0.7187 0.6132]);
set(gca,'FontName', 'Times New Roman','FontSize',18);
legend('GenParam')
axis([0,650,0,750]);
grid on;

subplot(3,1,2);
b1=bar(data_len(5:5:end),provedata(5:5:end));
b1.FaceColor=[0.4940 0.1840 0.5560];
%plot(data_len,provedata,'LineWidth',2,'Color',[0.4940 0.1840 0.5560]);
set(gca,'FontName', 'Times New Roman','FontSize',18);
legend('ProveData')
axis([0,650,0,250]);
grid on;

hold on;
subplot(3,1,3);
b2=bar(data_len(5:5:end),verifyproof(5:5:end));
b2.FaceColor=[0.4660 0.6740 0.1880];
%plot(data_len,verifyproof,'LineWidth',2,'Color',[0.4660 0.6740 0.1880]);
grid on;
set(gca,'FontName', 'Times New Roman','FontSize',18);
legend('VerifyProof');
axis([0,650,0,0.1]);

xlabel('The number of data points');
ylabel('Running time (second)');

figure;
plot(data_len,smartcontract,'LineWidth',2);
hold on;
plot(data_len,verifyproof,'->','LineWidth',2);
grid on;
legend('Smart Contract','VerifyProof');
set(gca,'FontName', 'Times New Roman','FontSize',22);
xlabel('The number of data points');
ylabel('Running time (second)');