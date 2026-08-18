package com.example.employee.service;

import com.example.employee.model.Employee;
import com.example.employee.repository.EmployeeRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmployeeServiceTest {

    @Mock
    private EmployeeRepository employeeRepository;

    @InjectMocks
    private EmployeeService employeeService;

    @Test
    void shouldCreateEmployee() {

        Employee employee = new Employee(
                null,
                "Rhowina",
                "Test",
                "rhowina@example.com",
                "9876543210",
                "Development"
        );

        Employee savedEmployee = new Employee(
                1L,
                "Rhowina",
                "Test",
                "rhowina@example.com",
                "9876543210",
                "Development"
        );

        when(employeeRepository.save(employee))
                .thenReturn(savedEmployee);

        Employee result =
                employeeService.saveEmployee(employee);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("Rhowina", result.getFirstName());

        verify(employeeRepository).save(employee);
    }


    @Test
    void shouldGetAllEmployees() {

        Employee employee = new Employee(
                1L,
                "Rhowina",
                "Test",
                "rhowina@example.com",
                "9876543210",
                "Development"
        );

        when(employeeRepository.findAll())
                .thenReturn(List.of(employee));

        List<Employee> result =
                employeeService.getAllEmployees();

        assertEquals(1, result.size());
        assertEquals("Rhowina", result.get(0).getFirstName());

        verify(employeeRepository).findAll();
    }


    @Test
    void shouldGetEmployeeById() {

        Employee employee = new Employee(
                1L,
                "Rhowina",
                "Test",
                "rhowina@example.com",
                "9876543210",
                "Development"
        );

        when(employeeRepository.findById(1L))
                .thenReturn(Optional.of(employee));

        Optional<Employee> result =
                employeeService.getEmployeeById(1L);

        assertTrue(result.isPresent());
        assertEquals("Rhowina",
                result.get().getFirstName());

        verify(employeeRepository).findById(1L);
    }


    @Test
    void shouldDeleteEmployee() {

        doNothing()
                .when(employeeRepository)
                .deleteById(1L);

        employeeService.deleteEmployee(1L);

        verify(employeeRepository)
                .deleteById(1L);
    }
}