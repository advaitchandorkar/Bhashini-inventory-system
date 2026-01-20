import csv
with open("C:/Users/HP/Downloads/inventory.csv", newline='') as csvfile:
    reader = csv.DictReader(csvfile)
    print(reader)
    for row in reader:
        print(row['productName'], row['quantity'])


print(row)